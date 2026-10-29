import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  CircularProgress,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { DetailSection } from "../components/DetailSection";
import { InfoBadge } from "../components/InfoBadge";

import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import {
  formatDate,
  getVerificationColor,
  getVerificationLabel,
} from "../../../model/factorings.helpers";
import {
  acceptFactoringLine,
  fetchFactoringLine,
} from "../../../api/factorings.api";
import { paletteKeyToColorPath } from "../../../../../shared/helpers/status-color.helpers";
import { StatusDot } from "../../../../../shared/ui/StatusDot";
import { notifyError } from "../../../../../shared/model/notifications.store";
import LegalDocumentViewer from "../../file-input/LegalDocumentViewer";

const POLL_INTERVAL_MS = 4000;

// TEMP: the customer's own factoring-line signing should only unlock once
// both forwarder and factor have signed (mirrors AvrSection's forwarderSigned
// gate). Disabled for now at product's request — flip back to `true` to
// re-enable the gate.
const ENABLE_PARTIES_SIGNED_GATE = false;

// The general factoring-line contract between forwarder and factor — already
// signed by both, purely view-only for the customer. No `signed` state, no
// sign action, no polling — distinct from FactoringLineCard below, which is
// the customer's OWN document that still needs their signature.
function FactoringLineDocumentCard({ document: lineDocument }) {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        p: 1.5,
        mb: 1.5,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        backgroundColor: "grey.50",
      }}
    >
      <Stack spacing={1.25}>
        <Box>
          <Typography fontWeight={700}>{t("factorings.line.contractTitle")}</Typography>

          <Typography fontSize={12} color="text.secondary">
            {t("factorings.line.contractNote")}
          </Typography>
        </Box>

        <LegalDocumentViewer file={lineDocument} />
      </Stack>
    </Box>
  );
}

function FactoringLineCard({ factoringId, line, bothPartiesSigned }) {
  const { t } = useTranslation();

  const [lineDocument, setLineDocument] = useState(line?.document || null);
  const [isSigned, setIsSigned] = useState(Boolean(line?.signed));
  const [isSigning, setIsSigning] = useState(false);
  const [signUrl, setSignUrl] = useState(null);

  const isLockedByParties =
    ENABLE_PARTIES_SIGNED_GATE && !bothPartiesSigned;

  const pollIntervalRef = useRef(null);
  const signExpiresAtRef = useRef(null);

  useEffect(() => {
    if (!isSigning) {
      setLineDocument(line?.document || null);
      setIsSigned(Boolean(line?.signed));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [line]);

  function stopPolling() {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }

  useEffect(() => stopPolling, []);

  function pollForSignature() {
    stopPolling();

    pollIntervalRef.current = setInterval(async () => {
      if (
        signExpiresAtRef.current &&
        Date.now() > signExpiresAtRef.current
      ) {
        stopPolling();
        setIsSigning(false);
        setSignUrl(null);
        notifyError(
          t("factorings.line.timeout"),
        );
        return;
      }

      try {
        const status = await fetchFactoringLine(factoringId);

        if (status?.document) {
          setLineDocument(status.document);
        }

        if (status?.signed) {
          stopPolling();
          setIsSigning(false);
          setIsSigned(true);
          setSignUrl(null);
        }
      } catch {
        // Transient poll errors are ignored — the interval retries on its
        // own until success, expiry, or unmount.
      }
    }, POLL_INTERVAL_MS);
  }

  async function handleSign() {
    if (isSigning || isSigned || isLockedByParties) {
      return;
    }

    setIsSigning(true);

    try {
      const session = await acceptFactoringLine(factoringId);

      signExpiresAtRef.current = session?.expires_at
        ? new Date(session.expires_at).getTime()
        : null;

      if (session?.sign_url) {
        setSignUrl(session.sign_url);
        window.open(session.sign_url, "_blank");
      }

      pollForSignature();
    } catch (error) {
      setIsSigning(false);
      setSignUrl(null);
      notifyError(
        error.response?.data?.message ||
          error.message ||
          t("factorings.line.signStartFailed"),
      );
    }
  }

  return (
    <Box
      sx={{
        p: 1.5,
        mb: 1.5,
        border: "1px solid",
        borderColor: isSigned ? "divider" : "primary.light",
        borderRadius: 2,
        backgroundColor: isSigned
          ? "grey.50"
          : "rgba(33, 150, 243, 0.04)",
        opacity: isLockedByParties ? 0.5 : 1,
        pointerEvents: isLockedByParties ? "none" : "auto",
      }}
    >
      <Stack spacing={1.25}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Typography fontWeight={700}>{t("factorings.line.yourSignature")}</Typography>

          <StatusDot
            label={isSigned ? t("enums.signature.signed") : t("enums.signature.notSigned")}
            color={paletteKeyToColorPath(
              getVerificationColor(isSigned),
            )}
          />
        </Box>

        {isLockedByParties && (
          <Typography fontSize={12} color="text.secondary">
            {t("factorings.line.waitForParties")}
          </Typography>
        )}

        {lineDocument && <LegalDocumentViewer file={lineDocument} />}

        {!isSigned && (
          <Button
            variant="outlined"
            size="small"
            disabled={isSigning || isLockedByParties}
            onClick={handleSign}
            sx={{ alignSelf: "flex-start" }}
            startIcon={isSigning ? <CircularProgress size={16} /> : undefined}
          >
            {isSigning ? t("common.signing.waiting") : t("common.actions.sign")}
          </Button>
        )}

        {isSigning && (
          <Typography fontSize={12} color="text.secondary">
            {t("common.signing.keepPageOpen")}
          </Typography>
        )}

        {isSigning && signUrl && (
          <Typography fontSize={12} color="text.secondary">
            {t("common.signing.windowHint")}{" "}
            <Link href={signUrl} target="_blank" rel="noopener noreferrer">
              {t("common.signing.thisLink")}
            </Link>
            .
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

export function FactoringVerificationSection({ factoring }) {
  const { t } = useTranslation();

  return (
    <DetailSection
      icon={<FactCheckOutlinedIcon />}
      title={t("factorings.confirmations.title")}
      subtitle={t("factorings.confirmations.subtitle")}
    >
      {factoring?.factoringLineDocument && (
        <FactoringLineDocumentCard document={factoring.factoringLineDocument} />
      )}

      {factoring?.factoringLine && (
        <FactoringLineCard
          factoringId={factoring.id}
          line={factoring.factoringLine}
          bothPartiesSigned={Boolean(
            factoring.verified_forwarder && factoring.verified_factor,
          )}
        />
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, 1fr)",
          },
          gap: 1,
        }}
      >
        <Box
          sx={{
            p: 1.5,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            backgroundColor: "grey.50",
          }}
        >
          <Stack spacing={1}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              <Typography fontWeight={700}>{t("factorings.confirmations.customer")}</Typography>

              <StatusDot
                label={getVerificationLabel(factoring.verified_customer)}
                color={paletteKeyToColorPath(getVerificationColor(factoring.verified_customer))}
              />
            </Box>

            <InfoBadge
              label={t("factorings.confirmations.date")}
              value={formatDate(factoring.date_verified_customer)}
              fullWidth
            />
          </Stack>
        </Box>

        <Box
          sx={{
            p: 1.5,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            backgroundColor: "grey.50",
          }}
        >
          <Stack spacing={1}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              <Typography fontWeight={700}>
                {t("factorings.confirmations.forwarder")}
              </Typography>

              <StatusDot
                label={getVerificationLabel(factoring.verified_forwarder)}
                color={paletteKeyToColorPath(getVerificationColor(factoring.verified_forwarder))}
              />
            </Box>

            <InfoBadge
              label={t("factorings.confirmations.date")}
              value={formatDate(factoring.date_verified_forwarder)}
              fullWidth
            />
          </Stack>
        </Box>

        <Box
          sx={{
            p: 1.5,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            backgroundColor: "grey.50",
          }}
        >
          <Stack spacing={1}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              <Typography fontWeight={700}>{t("factorings.confirmations.factor")}</Typography>

              <StatusDot
                label={getVerificationLabel(factoring.verified_factor)}
                color={paletteKeyToColorPath(getVerificationColor(factoring.verified_factor))}
              />
            </Box>

            <InfoBadge
              label={t("factorings.confirmations.date")}
              value={formatDate(factoring.verified_factor)}
              fullWidth
            />
          </Stack>
        </Box>
      </Box>
    </DetailSection>
  );
}

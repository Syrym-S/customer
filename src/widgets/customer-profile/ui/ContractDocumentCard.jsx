/* eslint-disable react/prop-types */
import { useState } from "react";
import i18n from "../../../shared/i18n";
import { useTranslation } from "react-i18next";
import { Box, CircularProgress, Typography } from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";

import { useContractStore, attemptContractSigning } from "../../../shared/model/contract.store";
import { notifyError } from "../../../shared/model/notifications.store";

function formatDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("ru-RU");
}

function classifySigningError(error) {
  const status = error.response?.status;
  const message = error.response?.data?.message;

  if (status === 422 || status === 502) {
    return i18n.t("profile.contract.signStartFailedLater");
  }

  return message || error.message || i18n.t("profile.contract.signStartFailed");
}

// The signed contract has no separate download endpoint — its content comes
// back as base64 in the same GET /customer/profile/v1/documents response
// used for the registration/employer documents (context: "contract").
function downloadContractDocument(contractDocument) {
  if (!contractDocument?.content) {
    notifyError(i18n.t("profile.contract.unavailable"));
    return;
  }

  const base64 = contractDocument.content.replace(/^data:[^;]+;base64,/, "");
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);

  for (let index = 0; index < binaryString.length; index += 1) {
    bytes[index] = binaryString.charCodeAt(index);
  }

  const blob = new Blob([bytes], {
    type: contractDocument.mime || "application/pdf",
  });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = contractDocument.name || "";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

export function ContractDocumentCard({ documents }) {
  const { t } = useTranslation();

  const hasValidContract = useContractStore((state) => state.hasValidContract);
  const contractExpiresAt = useContractStore((state) => state.contractExpiresAt);

  const [isSigning, setIsSigning] = useState(false);

  const isSigned = hasValidContract === true;

  async function handleClick() {
    if (isSigned) {
      const contractDocument = documents?.find(
        (document) => document.context === "contract",
      );

      downloadContractDocument(contractDocument);
      return;
    }

    if (isSigning) {
      return;
    }

    setIsSigning(true);

    try {
      const result = await attemptContractSigning();

      if (result.type === "already-signed") {
        setIsSigning(false);
      }

      // 'redirecting' leaves isSigning true — the tab is about to navigate away.
    } catch (error) {
      notifyError(classifySigningError(error));
      setIsSigning(false);
    }
  }

  const expiresLabel = formatDate(contractExpiresAt);

  return (
    <Box
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          handleClick();
        }
      }}
      sx={{
        p: 2,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        border: "1px solid",
        borderColor: isSigned ? "divider" : "warning.main",
        borderRadius: 2,
        backgroundColor: isSigned ? "background.paper" : "rgba(237, 108, 2, 0.04)",
        cursor: isSigning ? "default" : "pointer",
        opacity: isSigning ? 0.7 : 1,
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isSigned
            ? "rgba(46, 125, 50, 0.08)"
            : "rgba(237, 108, 2, 0.08)",
          flexShrink: 0,
        }}
      >
        {isSigning ? (
          <CircularProgress size={20} />
        ) : isSigned ? (
          <InsertDriveFileOutlinedIcon color="primary" fontSize="large" />
        ) : (
          <DescriptionOutlinedIcon color="warning" fontSize="large" />
        )}
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {t("profile.contract.title")}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          {isSigning
            ? t("common.signing.opening")
            : isSigned
              ? expiresLabel
                ? t("profile.contract.signedUntil", { date: expiresLabel })
                : t("profile.contract.signed")
              : t("profile.contract.notSigned")}
        </Typography>
      </Box>
    </Box>
  );
}

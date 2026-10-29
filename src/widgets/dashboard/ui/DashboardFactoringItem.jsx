/* eslint-disable react/prop-types */
import { Box, Chip, Divider, Paper, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  getFactoringStatusColor,
  getFactoringStatusLabel,
} from "../../customer-factorings/model/factorings.helpers";
import { useFactoringsContext } from "../../customer-factorings/model/useFactoringsContext";
import { formatAmount } from "../../../shared/helpers/currency-format.helpers";
import { paletteKeyToColorPath } from "../../../shared/helpers/status-color.helpers";
import { StatusDot } from "../../../shared/ui/StatusDot";

function InfoText({ label, value }) {
  const { t } = useTranslation();

  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: 13,
          lineHeight: 1.35,
          fontWeight: 500,
          overflowWrap: "anywhere",
        }}
      >
        {value || t("common.empty.notSpecifiedN")}
      </Typography>
    </Box>
  );
}

export function DashboardFactoringItem({ factoring }) {
  const { t } = useTranslation();

  const { openFactoringDetails } = useFactoringsContext();

  const isCancelled = factoring?.status === "cancelled";

  function handleOpenFactoring() {
    openFactoringDetails(factoring);
  }

  return (
    <Paper
      variant="outlined"
      onClick={handleOpenFactoring}
      role="button"
      tabIndex={0}
      sx={{
        p: 1.5,
        borderRadius: 2,
        cursor: "pointer",
        transition: "0.2s ease",
        borderColor: isCancelled ? "grey.300" : "divider",
        backgroundColor: isCancelled ? "grey.100" : "background.paper",
        opacity: isCancelled ? 0.82 : 1,
        "&:hover": {
          borderColor: isCancelled ? "grey.400" : "primary.light",
          boxShadow: isCancelled
            ? "0 4px 12px rgba(0, 0, 0, 0.06)"
            : "0 6px 18px rgba(33, 150, 243, 0.12)",
        },
      }}
    >
      <Stack spacing={1.25}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 1,
            flexWrap: "wrap",
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 1,
              minWidth: 0,
              flex: "1 1 220px",
            }}
          >
            <Chip
              label={t("factorings.details.number", { id: factoring?.id })}
              size="small"
              color="primary"
              variant="outlined"
              title={
                t("factorings.details.number", { id: factoring?.id ?? "—" })
              }
              sx={{
                fontWeight: 600,
                borderRadius: 999,
                maxWidth: "100%",
                "& .MuiChip-label": {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                },
              }}
            />

            <StatusDot
              label={getFactoringStatusLabel(factoring.status)}
              color={paletteKeyToColorPath(getFactoringStatusColor(factoring.status))}
            />
          </Box>
        </Box>
        <Box>
          <InfoText
            label={t("common.fields.forwarder")}
            value={factoring.forwarder.company_name}
          />
        </Box>
        <Divider />
        <Box>
          <InfoText label={t("common.fields.forwarderBin")} value={factoring.forwarder.bin} />
        </Box>
        <Box>
          <InfoText label={t("common.fields.forwarderFullName")} value={factoring.forwarder.fio} />
        </Box>
        <Box>
          <InfoText
            label={t("factorings.finance.debtAmount")}
            value={formatAmount(factoring.deb_summ)}
          />
        </Box>{" "}
        <Box>
          <InfoText
            label={t("factorings.finance.creditAmount")}
            value={formatAmount(factoring.cred_summ)}
          />
        </Box>
      </Stack>
    </Paper>
  );
}

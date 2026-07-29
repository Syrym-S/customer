/* eslint-disable react/prop-types */
import { Box, Chip, Divider, Paper, Stack, Typography } from "@mui/material";
import {
  getFactoringStatusColor,
  getFactoringStatusLabel,
} from "../../customer-factorings/model/factorings.helpers";
import { useFactoringsContext } from "../../customer-factorings/model/useFactoringsContext";

function InfoText({ label, value }) {
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
        {value || "Не указано"}
      </Typography>
    </Box>
  );
}

export function DashboardFactoringItem({ factoring }) {
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
              label={`Факторинг #${factoring?.id}`}
              size="small"
              color="primary"
              variant="outlined"
              title={
                factoring?.id ? `Факторинг #${factoring.id}` : "Факторинг #—"
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

            <Chip
              label={getFactoringStatusLabel(factoring.status)}
              color={getFactoringStatusColor(factoring.status)}
              size="small"
              sx={{
                borderRadius: 999,
                fontWeight: 600,
              }}
            />
          </Box>
        </Box>
        <Box>
          <InfoText
            label="Экпедитор"
            value={factoring.forwarder.company_name}
          />
        </Box>
        <Divider />
        <Box>
          <InfoText label="БИН экпедитора" value={factoring.forwarder.bin} />
        </Box>
        <Box>
          <InfoText label="ФИО экспедитора" value={factoring.forwarder.fio} />
        </Box>
        <Box>
          <InfoText label="Дебиторская сумма" value={factoring.deb_summ} />
        </Box>{" "}
        <Box>
          <InfoText label="Кредитная сумма" value={factoring.cred_summ} />
        </Box>
      </Stack>
    </Paper>
  );
}

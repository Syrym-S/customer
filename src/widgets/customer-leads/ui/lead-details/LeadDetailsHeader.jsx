import { Box, Chip, DialogTitle, Stack, Typography } from "@mui/material";
import PropTypes from "prop-types";
import { LeadStatusChip } from "../../../dashboard/ui/DashboardLeadItem";

export function LeadDetailsHeader({ lead }) {
  return (
    <DialogTitle
      sx={{
        pl: 3,
        pr: 7,
        pt: 3,
        pb: 1.5,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: {
                xs: "18px",
                sm: "20px",
              },
              fontWeight: 600,
              lineHeight: 1.3,
            }}
          >
            Информация о заказе
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Подробные данные по заявке
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            flexWrap: "wrap",
          }}
          useFlexGap
        >
          <Chip
            label={`Заказ #${lead.num || "—"}`}
            color="primary"
            variant="outlined"
            size="small"
            sx={{
              borderRadius: 999,
              fontWeight: 600,
              backgroundColor: "rgba(33, 150, 243, 0.04)",
            }}
          />

          {lead.pass_verify && (
            <Chip
              label="Видеофиксация отключена"
              color="warning"
              variant="outlined"
              size="small"
              sx={{
                borderRadius: 999,
                fontWeight: 600,
                backgroundColor: "rgba(237, 108, 2, 0.06)",
              }}
            />
          )}

          <LeadStatusChip status={lead.status} />
        </Stack>
      </Box>
    </DialogTitle>
  );
}

LeadDetailsHeader.propTypes = {
  lead: PropTypes.object.isRequired,
};

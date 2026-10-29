import { Box, Chip, DialogTitle, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { LeadStatusChip } from "../../../dashboard/ui/DashboardLeadItem";
import { usePageTitleSegment } from "../../../../shared/lib/usePageTitleSegment";

export function LeadDetailsHeader({ lead }) {
  const { t } = useTranslation();

  usePageTitleSegment(
    lead.num ? t("leads.details.shipmentNumber", { num: lead.num }) : null,
  );

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
            {t("leads.details.info")}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t("leads.details.subtitle")}
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
            label={t("leads.details.number", { num: lead.num || "—" })}
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
              label={t("leads.details.videoDisabled")}
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

          <LeadStatusChip lead={lead} />
        </Stack>
      </Box>
    </DialogTitle>
  );
}

LeadDetailsHeader.propTypes = {
  lead: PropTypes.object.isRequired,
};

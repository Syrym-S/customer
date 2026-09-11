import { Box, Stack, Typography } from "@mui/material";
import { DetailSection } from "../components/DetailSection";
import { InfoBadge } from "../components/InfoBadge";

import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import {
  formatDate,
  getVerificationColor,
  getVerificationLabel,
} from "../../../model/factorings.helpers";
import { paletteKeyToColorPath } from "../../../../../shared/helpers/status-color.helpers";
import { StatusDot } from "../../../../../shared/ui/StatusDot";

export function FactoringVerificationSection({ factoring }) {
  return (
    <DetailSection
      icon={<FactCheckOutlinedIcon />}
      title="Подтверждения"
      subtitle="Статусы подтверждения сторон"
    >
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
              <Typography fontWeight={700}>Подтверждение заказчика</Typography>

              <StatusDot
                label={getVerificationLabel(factoring.verified_customer)}
                color={paletteKeyToColorPath(getVerificationColor(factoring.verified_customer))}
              />
            </Box>

            <InfoBadge
              label="Дата подтверждения"
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
                Подтверждение экспедитора
              </Typography>

              <StatusDot
                label={getVerificationLabel(factoring.verified_forwarder)}
                color={paletteKeyToColorPath(getVerificationColor(factoring.verified_forwarder))}
              />
            </Box>

            <InfoBadge
              label="Дата подтверждения"
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
              <Typography fontWeight={700}>Подтверждение фактора</Typography>

              <StatusDot
                label={getVerificationLabel(factoring.verified_factor)}
                color={paletteKeyToColorPath(getVerificationColor(factoring.verified_factor))}
              />
            </Box>

            <InfoBadge
              label="Дата подтверждения"
              value={formatDate(factoring.verified_factor)}
              fullWidth
            />
          </Stack>
        </Box>
      </Box>
    </DetailSection>
  );
}

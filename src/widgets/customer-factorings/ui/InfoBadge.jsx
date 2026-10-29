import { Box, Typography } from '@mui/material';
import { useTranslation } from "react-i18next";

export function InfoBadge({ label, value, accent = false, sx = {} }) {
    const { t } = useTranslation();

    return (
        <Box
            sx={{
                px: 1.5,
                py: 1,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                backgroundColor: 'grey.50',
                minWidth: 0,
                ...sx,
            }}
        >
            <Typography
                sx={{
                    fontSize: 11,
                    lineHeight: 1.2,
                    color: 'text.secondary',
                    mb: 0.25,
                }}
            >
                {label}
            </Typography>

            <Typography
                sx={{
                    fontSize: 14,
                    lineHeight: 1.3,
                    color: accent ? 'primary.main' : 'text.primary',
                    fontWeight: accent ? 600 : 400,
                    overflowWrap: 'anywhere',
                }}
            >
                {value || t("common.empty.notSpecifiedN")}
            </Typography>
        </Box>
    );
}

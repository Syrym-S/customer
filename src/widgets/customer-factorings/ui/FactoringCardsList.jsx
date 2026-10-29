import { Box, Stack, Typography } from '@mui/material';
import { useTranslation } from "react-i18next";
import { FactoringCard } from './FactoringCard';

export function FactoringCardsList({ factorings, onOpenDetails }) {
    const { t } = useTranslation();

    if (factorings.length === 0) {
        return (
            <Box
                sx={{
                    py: 5,
                    px: 2,
                    textAlign: 'center',
                }}
            >
                <Typography color="text.secondary">
                    {t("factorings.notFound")}
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                p: {
                    xs: 2,
                    sm: 3,
                },
            }}
        >
            <Stack
                spacing={2}
                sx={{
                    maxWidth: 760,
                    mx: 'auto',
                }}
            >
                {factorings.map((factoring) => (
                    <FactoringCard
                        key={factoring.id ?? factoring.index}
                        factoring={factoring}
                        onOpenDetails={onOpenDetails}
                    />
                ))}
            </Stack>
        </Box>
    );
}

import { Box, Stack, Typography } from '@mui/material';
import { FactoringCard } from './FactoringCard';

export function FactoringCardsList({ factorings, onOpenDetails }) {
    if (factorings.length === 0) {
        return (
            <Box
                sx={{
                    py: 5,
                    px: 2,
                    textAlign: 'center',
                }}
            >
                <Typography color='text.secondary'>
                    Факторинг-покупки не найдены
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
                        key={factoring.index}
                        factoring={factoring}
                        onOpenDetails={onOpenDetails}
                    />
                ))}
            </Stack>
        </Box>
    );
}

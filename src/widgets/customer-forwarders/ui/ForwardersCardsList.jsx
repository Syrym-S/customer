import { Box, Paper, Stack, Typography } from '@mui/material';
import { useTranslation } from "react-i18next";
import { ForwarderCard } from './ForwarderCard';
import { getForwarderId } from '../model/forwarders.helpers';

export function ForwardersCardsList({ forwarders, onOpenDetails }) {
    const { t } = useTranslation();

    if (forwarders.length === 0) {
        return (
            <Paper
                sx={{
                    borderRadius: 3,
                    py: 5,
                    px: 2,
                    textAlign: 'center',
                }}
            >
                <Typography color='text.secondary'>
                    {t("forwarders.notFound")}
                </Typography>
            </Paper>
        );
    }

    return (
        <Box>
            <Stack
                spacing={2}
                sx={{
                    maxWidth: 760,
                    mx: 'auto',
                }}
            >
                {forwarders.map((forwarder) => (
                    <ForwarderCard
                        key={getForwarderId(forwarder)}
                        forwarder={forwarder}
                        onOpenDetails={onOpenDetails}
                    />
                ))}
            </Stack>
        </Box>
    );
}

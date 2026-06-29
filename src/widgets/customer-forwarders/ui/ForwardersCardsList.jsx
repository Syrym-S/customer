import { Box, Paper, Stack, Typography } from '@mui/material';
import { ForwarderCard } from './ForwarderCard';
import { getForwarderId } from '../model/forwarders.helpers';

export function ForwardersCardsList({ forwarders, onOpenDetails }) {
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
                    Экспедиторы не найдены
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

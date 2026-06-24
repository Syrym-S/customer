import { Box, Chip, DialogTitle, Stack, Typography } from '@mui/material';
import {
    getFactoringStatusColor,
    getFactoringStatusLabel,
} from '../../model/factorings.helpers';

export function FactoringDetailsHeader({ factoring }) {
    return (
        <DialogTitle
            sx={{
                px: 3,
                pt: 3,
                pb: 1.5,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 2,
                    flexWrap: 'wrap',
                }}
            >
                <Box>
                    <Typography
                        sx={{
                            fontSize: {
                                xs: '18px',
                                sm: '20px',
                            },
                            fontWeight: 600,
                            lineHeight: 1.3,
                        }}
                    >
                        Детали факторинга
                    </Typography>
                </Box>
                {factoring && (
                    <Stack
                        direction='row'
                        spacing={1}
                        useFlexGap
                        flexWrap='wrap'
                    >
                        <Chip
                            label={`Факторинг #${factoring?.index ?? '—'}`}
                            color='primary'
                            variant='outlined'
                            size='small'
                            sx={{
                                borderRadius: 999,
                                fontWeight: 600,
                                backgroundColor: 'rgba(33, 150, 243, 0.04)',
                            }}
                        />

                        <Chip
                            label={getFactoringStatusLabel(factoring?.status)}
                            color={getFactoringStatusColor(factoring?.status)}
                            size='small'
                            sx={{
                                borderRadius: 999,
                                fontWeight: 500,
                            }}
                        />
                    </Stack>
                )}
            </Box>
        </DialogTitle>
    );
}

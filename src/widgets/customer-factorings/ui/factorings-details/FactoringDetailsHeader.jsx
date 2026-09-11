import { Box, Chip, DialogTitle, Stack, Typography } from '@mui/material';
import {
    getFactoringStatusColor,
    getFactoringStatusLabel,
} from '../../model/factorings.helpers';
import { paletteKeyToColorPath } from '../../../../shared/helpers/status-color.helpers';
import { StatusDot } from '../../../../shared/ui/StatusDot';

export function FactoringDetailsHeader({ factoring }) {
    return (
        <DialogTitle
            sx={{
                pl: {
                    xs: 2,
                    sm: 3,
                },
                pr: {
                    xs: 6,
                    sm: 7,
                },
                pt: {
                    xs: 2,
                    sm: 3,
                },
                pb: 1.5,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: {
                        xs: 'stretch',
                        sm: 'flex-start',
                    },
                    gap: 2,
                    flexDirection: {
                        xs: 'column',
                        sm: 'row',
                    },
                    minWidth: 0,
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
                        direction={{
                            xs: 'column',
                            sm: 'row',
                        }}
                        spacing={1}
                        useFlexGap
                        flexWrap={{
                            xs: 'nowrap',
                            sm: 'wrap',
                        }}
                        sx={{
                            width: {
                                xs: '100%',
                                sm: 'auto',
                            },
                            alignItems: {
                                xs: 'flex-start',
                                sm: 'center',
                            },
                            minWidth: 0,
                        }}
                    >
                        <Chip
                            label={`Факторинг #${factoring?.id ?? '—'}`}
                            color='primary'
                            variant='outlined'
                            size='small'
                            sx={{
                                borderRadius: 999,
                                fontWeight: 600,
                                backgroundColor: 'rgba(33, 150, 243, 0.04)',
                            }}
                        />

                        <StatusDot
                            label={getFactoringStatusLabel(factoring?.status)}
                            color={paletteKeyToColorPath(getFactoringStatusColor(factoring?.status))}
                        />
                    </Stack>
                )}
            </Box>
        </DialogTitle>
    );
}

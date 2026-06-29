import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import {
    getForwarderBin,
    getForwarderCompanyName,
    getForwarderFio,
    getForwarderId,
    getForwarderIin,
    getForwarderPhone,
} from '../model/forwarders.helpers';

export function ForwarderCard({ forwarder, onOpenDetails }) {
    const forwarderId = getForwarderId(forwarder);

    return (
        <Paper
            elevation={0}
            onClick={() => onOpenDetails(forwarder)}
            role='button'
            tabIndex={0}
            sx={{
                p: {
                    xs: 2,
                    sm: 3,
                },
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                cursor: 'pointer',
                transition: '0.2s ease',
                overflow: 'hidden',
                '&:hover': {
                    borderColor: 'primary.light',
                    boxShadow: '0 8px 24px rgba(33, 150, 243, 0.12)',
                },
            }}
        >
            <Stack spacing={2}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: {
                            xs: 'flex-start',
                            sm: 'center',
                        },
                        gap: 1.5,
                        flexDirection: {
                            xs: 'column',
                            sm: 'row',
                        },
                    }}
                >
                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            sx={{
                                fontSize: {
                                    xs: 16,
                                    sm: 18,
                                },
                                fontWeight: 600,
                                lineHeight: 1.3,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                            title={getForwarderCompanyName(forwarder)}
                        >
                            {getForwarderCompanyName(forwarder)}
                        </Typography>

                        <Typography
                            sx={{
                                mt: 0.5,
                                fontSize: 12,
                                color: 'text.secondary',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                            title={forwarderId}
                        >
                            ID: {forwarderId || '—'}
                        </Typography>
                    </Box>

                    <Chip
                        label='Экспедитор'
                        color='primary'
                        variant='outlined'
                        size='small'
                        sx={{
                            borderRadius: 999,
                            fontWeight: 600,
                            flexShrink: 0,
                        }}
                    />
                </Box>

                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, minmax(0, 1fr))',
                        },
                        gap: 1,
                    }}
                >
                    <InfoBadge label='БИН' value={getForwarderBin(forwarder)} />

                    <InfoBadge label='ИИН' value={getForwarderIin(forwarder)} />

                    <InfoBadge
                        label='Представитель'
                        value={getForwarderFio(forwarder)}
                    />

                    <InfoBadge
                        label='Телефон'
                        value={getForwarderPhone(forwarder)}
                    />
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                    }}
                >
                    <Button
                        size='small'
                        variant='outlined'
                        onClick={(event) => {
                            event.stopPropagation();
                            onOpenDetails(forwarder);
                        }}
                    >
                        Подробнее
                    </Button>
                </Box>
            </Stack>
        </Paper>
    );
}

function InfoBadge({ label, value }) {
    return (
        <Box
            sx={{
                p: 1.25,
                borderRadius: 2,
                backgroundColor: 'grey.50',
                border: '1px solid',
                borderColor: 'divider',
                minWidth: 0,
            }}
        >
            <Typography
                sx={{
                    fontSize: 12,
                    color: 'text.secondary',
                    mb: 0.25,
                }}
            >
                {label}
            </Typography>

            <Typography
                title={value || '—'}
                sx={{
                    fontSize: 14,
                    fontWeight: 500,
                    lineHeight: 1.35,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}
            >
                {value || '—'}
            </Typography>
        </Box>
    );
}

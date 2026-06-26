import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import {
    formatDate,
    formatMoney,
    getFactoringStatusColor,
    getFactoringStatusLabel,
    getVerificationColor,
    getVerificationLabel,
} from '../model/factorings.helpers';
import { InfoBadge } from './InfoBadge';

export function FactoringCard({ factoring, onOpenDetails }) {
    return (
        <Box
            onClick={() => onOpenDetails(factoring)}
            role='button'
            tabIndex={0}
            sx={{
                p: {
                    xs: 2,
                    sm: 3,
                },
                border: '2px solid',
                borderColor: 'divider',
                borderRadius: 4,
                backgroundColor: 'background.paper',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                transition: '0.2s ease',
                cursor: 'pointer',
                '&:hover': {
                    borderColor: 'primary.light',
                    boxShadow: '0 8px 24px rgba(33, 150, 243, 0.12)',
                },
            }}
        >
            <Stack spacing={2.5}>
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
                            variant='body2'
                            color='text.secondary'
                            sx={{ mb: 0.75 }}
                        >
                            Фактор
                        </Typography>

                        <Typography
                            sx={{
                                lineHeight: 1.3,
                                fontSize: {
                                    xs: '16px',
                                    sm: '18px',
                                },
                                fontWeight: 600,
                            }}
                        >
                            {factoring.factor?.company_name || '—'}
                        </Typography>

                        <Typography
                            sx={{
                                mt: 0.5,
                                fontSize: 13,
                                color: 'text.secondary',
                            }}
                        >
                            БИН: {factoring.factor?.bin || '—'}
                        </Typography>
                    </Box>

                    <Stack
                        direction='row'
                        spacing={1}
                        useFlexGap
                        sx={{
                            flexWrap: 'wrap',
                            justifyContent: {
                                xs: 'flex-start',
                                sm: 'flex-end',
                            },
                        }}
                    >
                        <Chip
                            label={`#${factoring.index}`}
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
                            label={getFactoringStatusLabel(factoring.status)}
                            color={getFactoringStatusColor(factoring.status)}
                            size='small'
                            sx={{
                                borderRadius: 999,
                                fontWeight: 600,
                            }}
                        />
                    </Stack>
                </Box>

                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, 1fr)',
                        },
                        gap: 1.5,
                    }}
                >
                    <InfoBadge
                        label='Экспедитор'
                        value={factoring.forwarder?.company_name || '—'}
                    />

                    <InfoBadge
                        label='БИН экспедитора'
                        value={factoring.forwarder?.bin || '—'}
                    />

                    {factoring.forwarder?.fio && (
                        <InfoBadge
                            label='ФИО экспедитора'
                            value={factoring.forwarder.fio}
                        />
                    )}

                    <InfoBadge
                        label='Дата создания'
                        value={formatDate(factoring.created_at)}
                    />
                </Box>

                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, 1fr)',
                        },
                        gap: 1,
                    }}
                >
                    <InfoBadge
                        label='Дебиторская сумма'
                        value={formatMoney(
                            factoring.deb_summ,
                            factoring.deb_currency,
                        )}
                        accent
                    />

                    <InfoBadge
                        label='Кредитная сумма'
                        value={formatMoney(
                            factoring.cred_summ,
                            factoring.currency,
                        )}
                        accent
                    />
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: {
                            xs: 'flex-start',
                            sm: 'center',
                        },
                        gap: 2,
                        flexDirection: {
                            xs: 'column',
                            sm: 'row',
                        },
                    }}
                >
                    <Stack
                        direction='row'
                        spacing={1}
                        useFlexGap
                        sx={{
                            flexWrap: 'wrap',
                        }}
                    >
                        <Chip
                            size='small'
                            label={`Вы: ${getVerificationLabel(
                                factoring.verified_customer,
                            )}`}
                            color={getVerificationColor(
                                factoring.verified_customer,
                            )}
                            sx={{
                                borderRadius: 999,
                            }}
                        />

                        <Chip
                            size='small'
                            label={`Экспедитор: ${getVerificationLabel(
                                factoring.verified_forwarder,
                            )}`}
                            color={getVerificationColor(
                                factoring.verified_forwarder,
                            )}
                            variant={
                                factoring.verified_forwarder
                                    ? 'filled'
                                    : 'outlined'
                            }
                            sx={{
                                borderRadius: 999,
                            }}
                        />
                    </Stack>

                    <Button
                        size='small'
                        variant='outlined'
                        onClick={(event) => {
                            event.stopPropagation();
                            onOpenDetails(factoring);
                        }}
                    >
                        Подробнее
                    </Button>
                </Box>
            </Stack>
        </Box>
    );
}

import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    Stack,
    Typography,
} from '@mui/material';
import {
    formatDate,
    formatMoney,
    formatPercent,
    getFactoringStatusColor,
    getFactoringStatusLabel,
    getForwarderName,
    getVerificationColor,
    getVerificationLabel,
} from '../helpers/factorings.helpers';

function InfoBlock({ label, value }) {
    return (
        <Box>
            <Typography fontSize={13} color='text.secondary'>
                {label}
            </Typography>

            <Typography fontWeight={600}>{value || '—'}</Typography>
        </Box>
    );
}

export function FactoringDetailsDialog({
    open,
    factoring,
    loading,
    error,
    accepting,
    acceptError,
    onClose,
    onAccept,
}) {
    const canAccept = factoring && !factoring.verified_customer;

    return (
        <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
            <DialogTitle>Детали факторинга</DialogTitle>

            <DialogContent>
                {loading && (
                    <Box
                        sx={{
                            minHeight: 200,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <CircularProgress />
                    </Box>
                )}

                {error && <Alert severity='error'>{error}</Alert>}

                {acceptError && <Alert severity='error'>{acceptError}</Alert>}

                {!loading && factoring && (
                    <Stack spacing={3}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <InfoBlock
                                    label='Номер'
                                    value={factoring.index}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <InfoBlock
                                    label='Статус'
                                    value={
                                        <Chip
                                            size='small'
                                            label={getFactoringStatusLabel(
                                                factoring.status,
                                            )}
                                            color={getFactoringStatusColor(
                                                factoring.status,
                                            )}
                                        />
                                    }
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <InfoBlock
                                    label='Дата создания'
                                    value={formatDate(factoring.created_at)}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <InfoBlock
                                    label='Lead ID'
                                    value={factoring.lead_id || '—'}
                                />
                            </Grid>
                        </Grid>

                        <Divider />

                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <InfoBlock
                                    label='Дебиторская сумма'
                                    value={formatMoney(
                                        factoring.deb_summ,
                                        factoring.deb_currency,
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <InfoBlock
                                    label='Кредитная сумма'
                                    value={formatMoney(
                                        factoring.cred_summ,
                                        factoring.currency,
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <InfoBlock
                                    label='Ставка факторинга'
                                    value={formatPercent(factoring.proc_factor)}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <InfoBlock
                                    label='Валюта'
                                    value={factoring.currency || 'KZT'}
                                />
                            </Grid>
                        </Grid>

                        <Divider />

                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <InfoBlock
                                    label='Экспедитор'
                                    value={getForwarderName(
                                        factoring.forwarder,
                                    )}
                                />

                                <Typography
                                    fontSize={13}
                                    color='text.secondary'
                                >
                                    БИН:{' '}
                                    {factoring.forwarder?.company_bin || '—'}
                                </Typography>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <InfoBlock
                                    label='Подтверждение заказчика'
                                    value={
                                        <Chip
                                            size='small'
                                            label={getVerificationLabel(
                                                factoring.verified_customer,
                                            )}
                                            color={getVerificationColor(
                                                factoring.verified_customer,
                                            )}
                                        />
                                    }
                                />

                                <Typography
                                    fontSize={13}
                                    color='text.secondary'
                                >
                                    Дата:{' '}
                                    {formatDate(
                                        factoring.date_verified_customer,
                                    )}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Stack>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={accepting}>
                    Закрыть
                </Button>

                {canAccept && (
                    <Button
                        variant='contained'
                        onClick={onAccept}
                        disabled={accepting}
                    >
                        {accepting ? 'Подтверждение...' : 'Подтвердить'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}

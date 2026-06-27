import {
    Alert,
    Box,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Typography,
} from '@mui/material';

import {
    getForwarderBin,
    getForwarderCompanyName,
    getForwarderFio,
    getForwarderIin,
    getForwarderPhone,
} from '../model/forwarders.helpers';

function getValue(value) {
    return value || 'Не указан';
}

function ForwarderDataTable({ forwarder }) {
    const rows = [
        {
            label: 'Компания',
            value: getForwarderCompanyName(forwarder),
        },
        {
            label: 'БИН',
            value: getForwarderBin(forwarder),
        },
        {
            label: 'ИИН',
            value: getForwarderIin(forwarder),
        },
        {
            label: 'ФИО',
            value: getForwarderFio(forwarder),
        },
        {
            label: 'Телефон',
            value: getForwarderPhone(forwarder),
        },
        {
            label: 'Email',
            value: forwarder?.email || forwarder?.personEmail,
        },
        {
            label: 'Адрес компании',
            value: forwarder?.companyAddress || forwarder?.company_address,
        },
    ];

    return (
        <TableContainer component={Box}>
            <Table size='small'>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow key={row.label}>
                            <TableCell
                                sx={{
                                    width: '40%',
                                    color: 'text.secondary',
                                    pl: 0,
                                }}
                            >
                                {row.label}:
                            </TableCell>

                            <TableCell
                                sx={{
                                    fontWeight: 500,
                                    pr: 0,
                                }}
                            >
                                {getValue(row.value)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export function ForwarderDetailsModal({
    open,
    forwarder,
    loading,
    error,
    onClose,
}) {
    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onClose}
            fullWidth
            maxWidth='sm'
        >
            <DialogTitle>
                <Typography fontWeight={700}>Детали экспедитора</Typography>
            </DialogTitle>

            <DialogContent>
                {loading && (
                    <Box
                        sx={{
                            py: 6,
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <CircularProgress />
                    </Box>
                )}

                {error && (
                    <Alert severity='error' sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {!loading && forwarder && (
                    <Box
                        sx={{
                            p: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 3,
                            backgroundColor: 'grey.50',
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: 15,
                                fontWeight: 600,
                                mb: 1.5,
                            }}
                        >
                            Реквизиты экспедитора
                        </Typography>

                        <ForwarderDataTable forwarder={forwarder} />
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={loading}>
                    Закрыть
                </Button>
            </DialogActions>
        </Dialog>
    );
}

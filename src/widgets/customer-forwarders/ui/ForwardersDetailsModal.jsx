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
    getForwarderAccount,
    getForwarderAddress,
    getForwarderBik,
    getForwarderBin,
    getForwarderCompanyName,
    getForwarderEmail,
    getForwarderFio,
    getForwarderIin,
    // getForwarderId,
    getForwarderPhone,
} from '../model/forwarders.helpers';
// import { TaxationRegimeInfo } from '../../../shared/kgd-taxation/ui/TaxationRegimeInfo';

function getValue(value) {
    return value || 'Не указан';
}

function ForwarderDataGroup({ title, rows }) {
    return (
        <Box
            sx={{
                mb: 2,
                p: {
                    xs: 1.25,
                    sm: 1.5,
                },
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                '&:last-of-type': {
                    mb: 0,
                },
            }}
        >
            <Typography
                sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'text.secondary',
                    mb: 0.5,
                }}
            >
                {title}
            </Typography>

            <TableContainer component={Box}>
                <Table size="small">
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
        </Box>
    );
}

function ForwarderDataTable({ forwarder }) {
    const companyRows = [
        {
            label: 'Компания',
            value: getForwarderCompanyName(forwarder),
        },
        {
            label: 'БИН',
            value: getForwarderBin(forwarder),
        },
        {
            label: 'БИК',
            value: getForwarderBik(forwarder),
        },
        {
            label: 'Расчетный счет',
            value: getForwarderAccount(forwarder),
        },
        {
            label: 'Адрес компании',
            value: getForwarderAddress(forwarder),
        },
    ];

    const contactRows = [
        {
            label: 'ФИО',
            value: getForwarderFio(forwarder),
        },
        {
            label: 'ИИН',
            value: getForwarderIin(forwarder),
        },
        {
            label: 'Телефон',
            value: getForwarderPhone(forwarder),
        },
        {
            label: 'Email',
            value: getForwarderEmail(forwarder),
        },
    ];

    return (
        <Box>
            <ForwarderDataGroup
                title="Данные экспедитора — компания"
                rows={companyRows}
            />

            <ForwarderDataGroup
                title="Данные контактного лица"
                rows={contactRows}
            />
        </Box>
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
            maxWidth="sm"
            slotProps={{
                paper: {
                    sx: {
                        m: {
                            xs: 1,
                            sm: 2,
                        },
                        width: {
                            xs: 'calc(100% - 16px)',
                            sm: 'calc(100% - 64px)',
                        },
                        borderRadius: {
                            xs: 2,
                            sm: 3,
                        },
                        overflowX: 'hidden',
                    },
                },
            }}
        >
            <DialogContent
                sx={{
                    px: {
                        xs: 1.5,
                        sm: 3,
                    },
                    py: {
                        xs: 1,
                        sm: 2,
                    },
                    overflowX: 'hidden',
                }}
            >
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
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {!loading && forwarder && (
                    <Box
                        sx={{
                            p: {
                                xs: 1,
                                sm: 2,
                            },
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

                        {/* <Box sx={{ mt: 2 }}>
                            <TaxationRegimeInfo
                                role="forwarder"
                                entityId={getForwarderId(forwarder)}
                            />
                        </Box> */}
                    </Box>
                )}
            </DialogContent>

            <DialogActions
                sx={{
                    px: {
                        xs: 1.5,
                        sm: 3,
                    },
                    pb: {
                        xs: 1.5,
                        sm: 2,
                    },
                }}
            >
                <Button onClick={onClose} disabled={loading}>
                    Закрыть
                </Button>
            </DialogActions>
        </Dialog>
    );
}

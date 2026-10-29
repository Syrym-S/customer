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
import i18n from '../../../shared/i18n';
import { useTranslation } from "react-i18next";

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
    return value || i18n.t("common.empty.notSpecifiedM");
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
    const { t } = useTranslation();

    const companyRows = [
        {
            label: t("common.fields.company"),
            value: getForwarderCompanyName(forwarder),
        },
        {
            label: t("common.fields.bin"),
            value: getForwarderBin(forwarder),
        },
        {
            label: t("common.fields.bik"),
            value: getForwarderBik(forwarder),
        },
        {
            label: t("common.fields.settlementAccount"),
            value: getForwarderAccount(forwarder),
        },
        {
            label: t("common.fields.companyAddress"),
            value: getForwarderAddress(forwarder),
        },
    ];

    const contactRows = [
        {
            label: t("common.fields.fullName"),
            value: getForwarderFio(forwarder),
        },
        {
            label: t("common.fields.iin"),
            value: getForwarderIin(forwarder),
        },
        {
            label: t("common.fields.phone"),
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
                title={t("forwarders.sections.company")}
                rows={companyRows}
            />

            <ForwarderDataGroup
                title={t("forwarders.sections.contact")}
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
    const { t } = useTranslation();

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
                            {t("forwarders.sections.requisites")}
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
                    {t("common.actions.close")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

import {
    Box,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Typography,
} from '@mui/material';
import { useTranslation } from "react-i18next";

function PartyDataTable({ rows }) {
    const { t } = useTranslation();

    return (
        <TableContainer component={Box}>
            <Table size='small'>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow key={row.label}>
                            <TableCell
                                sx={{
                                    width: { xs: '34%', sm: '42%' },
                                    color: 'text.secondary',
                                    fontSize: 13,
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                    pl: 0,
                                    pr: { xs: 1, sm: 2 },
                                }}
                            >
                                {row.label}:
                            </TableCell>

                            <TableCell
                                sx={{
                                    fontSize: 13,
                                    fontWeight: 500,
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                    pl: { xs: 1, sm: 2 },
                                    pr: 0,
                                    overflowWrap: 'anywhere',
                                }}
                            >
                                {row.value || t("common.empty.notSpecifiedM")}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export function FactoringPartiesRequisitesSection({
    factoring,
    customerProfile,
    isCustomerProfileLoading,
    customerProfileLoadFailed,
}) {
    const { t } = useTranslation();

    const forwarder = factoring.forwarder || {};
    const factor = factoring.factor || {};

    const forwarderRows = [
        {
            label: t("common.fields.company"),
            value: forwarder.company_name || forwarder.companyName,
        },
        {
            label: t("common.fields.bin"),
            value: forwarder.bin || forwarder.company_bin,
        },
        {
            label: t("common.fields.fullName"),
            value: forwarder.fio || forwarder.fullname || forwarder.fullName,
        },
        {
            label: 'Email',
            value: forwarder.personEmail || forwarder.email,
        },
        {
            label: t("common.fields.iin"),
            value: forwarder.personIin || forwarder.iin,
        },
        {
            label: t("common.fields.number"),
            value: forwarder.phone,
        },
        {
            label: t("common.fields.companyAddress"),
            value: forwarder.companyAddress || forwarder.company_address,
        },
    ];

    const factorRows = [
        {
            label: t("common.fields.company"),
            value: factor.company_name || factor.companyName,
        },
        {
            label: t("common.fields.bin"),
            value: factor.bin || factor.company_bin,
        },
        {
            label: t("common.fields.fullName"),
            value: factor.fio || factor.fullname || factor.fullName,
        },
        {
            label: 'Email',
            value: factor.personEmail || factor.email,
        },
        {
            label: t("common.fields.iin"),
            value: factor.personIin || factor.iin,
        },
        {
            label: t("common.fields.number"),
            value: factor.phone,
        },
        {
            label: t("common.fields.companyAddress"),
            value: factor.companyAddress || factor.company_address,
        },
    ];

    const customerRows = [
        {
            label: t("common.fields.company"),
            value: customerProfile?.fullName,
        },
        {
            label: t("common.fields.bin"),
            value: customerProfile?.bin,
        },
        {
            label: t("common.fields.fullName"),
            value: customerProfile?.personFio,
        },
        {
            label: 'Email',
            value: customerProfile?.personEmail,
        },
        {
            label: t("common.fields.iin"),
            value: customerProfile?.personIin,
        },
        {
            label: t("common.fields.number"),
            value: customerProfile?.personPhone,
        },
        {
            label: t("common.fields.companyAddress"),
            value: customerProfile?.legalAddress,
        },
    ];

    return (
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
                    mb: 2,
                }}
            >
                {t("factorings.requisites.title")}
            </Typography>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: 'minmax(0, 1fr)',
                        md: 'repeat(2, minmax(0, 1fr))',
                        lg: 'repeat(3, minmax(0, 1fr))',
                    },
                    gap: 2,
                }}
            >
                <Box
                    sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: 14,
                            fontWeight: 600,
                            mb: 1,
                        }}
                    >
                        {t("enums.participantType.forwarder")}
                    </Typography>

                    <PartyDataTable rows={forwarderRows} />
                </Box>

                <Box
                    sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: 14,
                            fontWeight: 600,
                            mb: 1,
                        }}
                    >
                        {t("common.fields.factor")}
                    </Typography>

                    <PartyDataTable rows={factorRows} />
                </Box>

                <Box
                    sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: 14,
                            fontWeight: 600,
                            mb: 1,
                        }}
                    >
                        {t("common.fields.customer")}
                    </Typography>

                    {isCustomerProfileLoading ? (
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                py: 3,
                            }}
                        >
                            <CircularProgress size={20} />
                        </Box>
                    ) : customerProfileLoadFailed ? (
                        <Typography fontSize={13} color="text.secondary">
                            {t("factorings.requisites.loadFailed")}
                        </Typography>
                    ) : (
                        <PartyDataTable rows={customerRows} />
                    )}
                </Box>
            </Box>
        </Box>
    );
}

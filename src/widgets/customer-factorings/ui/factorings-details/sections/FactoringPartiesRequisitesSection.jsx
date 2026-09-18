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

function PartyDataTable({ rows }) {
    return (
        <TableContainer component={Box}>
            <Table size='small'>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow key={row.label}>
                            <TableCell
                                sx={{
                                    width: '42%',
                                    color: 'text.secondary',
                                    fontSize: 13,
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                    pl: 0,
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
                                    pr: 0,
                                }}
                            >
                                {row.value || 'Не указан'}
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
    const forwarder = factoring.forwarder || {};
    const factor = factoring.factor || {};

    const forwarderRows = [
        {
            label: 'Компания',
            value: forwarder.company_name || forwarder.companyName,
        },
        {
            label: 'БИН',
            value: forwarder.bin || forwarder.company_bin,
        },
        {
            label: 'ФИО',
            value: forwarder.fio || forwarder.fullname || forwarder.fullName,
        },
        {
            label: 'Email',
            value: forwarder.personEmail || forwarder.email,
        },
        {
            label: 'ИИН',
            value: forwarder.personIin || forwarder.iin,
        },
        {
            label: 'Номер',
            value: forwarder.phone,
        },
        {
            label: 'Адрес компании',
            value: forwarder.companyAddress || forwarder.company_address,
        },
    ];

    const factorRows = [
        {
            label: 'Компания',
            value: factor.company_name || factor.companyName,
        },
        {
            label: 'БИН',
            value: factor.bin || factor.company_bin,
        },
        {
            label: 'ФИО',
            value: factor.fio || factor.fullname || factor.fullName,
        },
        {
            label: 'Email',
            value: factor.personEmail || factor.email,
        },
        {
            label: 'ИИН',
            value: factor.personIin || factor.iin,
        },
        {
            label: 'Номер',
            value: factor.phone,
        },
        {
            label: 'Адрес компании',
            value: factor.companyAddress || factor.company_address,
        },
    ];

    const customerRows = [
        {
            label: 'Компания',
            value: customerProfile?.fullName,
        },
        {
            label: 'БИН',
            value: customerProfile?.bin,
        },
        {
            label: 'ФИО',
            value: customerProfile?.personFio,
        },
        {
            label: 'Email',
            value: customerProfile?.personEmail,
        },
        {
            label: 'ИИН',
            value: customerProfile?.personIin,
        },
        {
            label: 'Номер',
            value: customerProfile?.personPhone,
        },
        {
            label: 'Адрес компании',
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
                Реквизиты сторон
            </Typography>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
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
                        Экспедитор
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
                        Фактор
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
                        Заказчик
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
                            Не удалось загрузить реквизиты заказчика
                        </Typography>
                    ) : (
                        <PartyDataTable rows={customerRows} />
                    )}
                </Box>
            </Box>
        </Box>
    );
}

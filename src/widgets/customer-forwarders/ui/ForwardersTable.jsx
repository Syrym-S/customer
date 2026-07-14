import { Box, Paper, Stack } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import {
    getForwarderAccount,
    getForwarderAddress,
    getForwarderBik,
    getForwarderBin,
    getForwarderCompanyName,
    getForwarderFio,
    getForwarderId,
    getForwarderIin,
    getForwarderPhone,
} from '../model/forwarders.helpers';
import { ForwarderInviteLink } from './ForwarderInviteLink';

export function ForwardersTable({ forwarders, onOpenDetails }) {
    const columns = [
        {
            field: 'id',
            headerName: 'ID',
            width: 200,
            renderCell: ({ row }) => {
                const forwarderId = getForwarderId(row);

                return (
                    <Box
                        sx={{
                            color: 'primary.main',
                            cursor: 'pointer',
                        }}
                    >
                        {forwarderId || '—'}
                    </Box>
                );
            },
        },
        {
            field: 'company',
            headerName: 'Компания',
            width: 240,
            renderCell: ({ row }) => (
                <Stack spacing={0.25}>
                    <Box>{getForwarderCompanyName(row)}</Box>

                    <Box
                        sx={{
                            fontSize: 12,
                            color: 'text.secondary',
                        }}
                    >
                        ID: {getForwarderId(row) || '—'}
                    </Box>
                </Stack>
            ),
        },
        {
            field: 'bin',
            headerName: 'БИН',
            width: 160,
            renderCell: ({ row }) => <Box>{getForwarderBin(row)}</Box>,
        },
        {
            field: 'iin',
            headerName: 'ИИН',
            width: 160,
            renderCell: ({ row }) => <Box>{getForwarderIin(row)}</Box>,
        },
        {
            field: 'fio',
            headerName: 'Представитель',
            width: 220,
            renderCell: ({ row }) => <Box>{getForwarderFio(row)}</Box>,
        },
        {
            field: 'phone',
            headerName: 'Телефон',
            width: 160,
            renderCell: ({ row }) => <Box>{getForwarderPhone(row)}</Box>,
        },
        {
            field: 'invite_link',
            headerName: 'Приглашение',
            width: 170,
            sortable: false,
            filterable: false,
            renderCell: ({ row }) => (
                <ForwarderInviteLink forwarder={row} compact />
            ),
        },
        {
            field: 'bik',
            headerName: 'БИК',
            width: 140,
            renderCell: ({ row }) => <Box>{getForwarderBik(row)}</Box>,
        },
        {
            field: 'account',
            headerName: 'Расчетный счет',
            width: 220,
            renderCell: ({ row }) => <Box>{getForwarderAccount(row)}</Box>,
        },
        {
            field: 'address',
            headerName: 'Адрес компании',
            width: 280,
            renderCell: ({ row }) => {
                const address = getForwarderAddress(row);

                return (
                    <Box
                        title={address}
                        sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '100%',
                        }}
                    >
                        {address}
                    </Box>
                );
            },
        },
    ];

    return (
        <Paper sx={{ height: '70vh', my: '10px' }}>
            <DataGrid
                rows={forwarders}
                getRowId={(row) => getForwarderId(row)}
                columns={columns}
                checkboxSelection
                onRowClick={(params) => {
                    onOpenDetails(params.row);
                }}
                localeText={{
                    noRowsLabel: 'Экспедиторы не найдены',
                }}
                sx={{ border: 0 }}
            />
        </Paper>
    );
}

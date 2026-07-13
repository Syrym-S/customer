import { Box, Paper, Stack } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import {
    getForwarderBin,
    getForwarderCompanyName,
    getForwarderFio,
    getForwarderId,
    getForwarderIin,
    getForwarderPhone,
} from '../model/forwarders.helpers';

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
            width: 180,
            renderCell: ({ row }) => <Box>{getForwarderBin(row)}</Box>,
        },
        {
            field: 'iin',
            headerName: 'ИИН',
            width: 180,
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
            width: 180,
            renderCell: ({ row }) => <Box>{getForwarderPhone(row)}</Box>,
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

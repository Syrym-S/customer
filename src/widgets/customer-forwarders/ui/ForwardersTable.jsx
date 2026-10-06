import { Box, Paper, Stack, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import {
    getZebraRowClassName,
    toSortString,
    truncateId,
} from '../../../shared/helpers/data-grid.helpers';
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

function getForwarderSortValue(value) {
    return toSortString(value, 'Не указан', 'Компания не указана');
}

export function ForwardersTable({ forwarders, onOpenDetails }) {
    const columns = [
        {
            field: 'id',
            headerName: '№',
            width: 130,
            valueGetter: (_, row) => getForwarderId(row),
            renderCell: ({ row }) => {
                const forwarderId = getForwarderId(row);

                return (
                    <Tooltip title={forwarderId || '—'}>
                        <Box
                            onClick={() => onOpenDetails(row)}
                            sx={{
                                color: 'primary.main',
                                cursor: 'pointer',
                                fontWeight: 600,
                                textDecoration: 'underline',
                                textUnderlineOffset: 2,
                                width: 'fit-content',
                            }}
                        >
                            {forwarderId ? truncateId(forwarderId) : '—'}
                        </Box>
                    </Tooltip>
                );
            },
        },
        {
            field: 'company',
            headerName: 'Компания',
            width: 240,
            valueGetter: (_, row) => getForwarderSortValue(getForwarderCompanyName(row)),
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
            cellClassName: 'tabular-nums',
            valueGetter: (_, row) => getForwarderSortValue(getForwarderBin(row)),
            renderCell: ({ row }) => <Box>{getForwarderBin(row)}</Box>,
        },
        {
            field: 'iin',
            headerName: 'ИИН',
            width: 160,
            cellClassName: 'tabular-nums',
            valueGetter: (_, row) => getForwarderSortValue(getForwarderIin(row)),
            renderCell: ({ row }) => <Box>{getForwarderIin(row)}</Box>,
        },
        {
            field: 'fio',
            headerName: 'Представитель',
            width: 220,
            valueGetter: (_, row) => getForwarderSortValue(getForwarderFio(row)),
            renderCell: ({ row }) => <Box>{getForwarderFio(row)}</Box>,
        },
        {
            field: 'phone',
            headerName: 'Телефон',
            width: 160,
            cellClassName: 'tabular-nums',
            valueGetter: (_, row) => getForwarderSortValue(getForwarderPhone(row)),
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
            cellClassName: 'tabular-nums',
            valueGetter: (_, row) => getForwarderSortValue(getForwarderBik(row)),
            renderCell: ({ row }) => <Box>{getForwarderBik(row)}</Box>,
        },
        {
            field: 'account',
            headerName: 'Расчетный счет',
            width: 220,
            cellClassName: 'tabular-nums',
            valueGetter: (_, row) => getForwarderSortValue(getForwarderAccount(row)),
            renderCell: ({ row }) => <Box>{getForwarderAccount(row)}</Box>,
        },
        {
            field: 'address',
            headerName: 'Адрес компании',
            width: 280,
            valueGetter: (_, row) => getForwarderSortValue(getForwarderAddress(row)),
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
                getRowClassName={getZebraRowClassName}
                hideFooter
                localeText={{
                    noRowsLabel: 'Экспедиторы не найдены',
                }}
                sx={{ border: 0 }}
            />
        </Paper>
    );
}

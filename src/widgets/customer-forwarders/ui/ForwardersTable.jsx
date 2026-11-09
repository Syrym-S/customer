import PropTypes from 'prop-types';
import { Box, Paper, Stack, Tooltip } from '@mui/material';
import i18n from '../../../shared/i18n';
import { useTranslation } from "react-i18next";
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
    return toSortString(
        value,
        i18n.t("common.empty.notSpecifiedM"),
        i18n.t("common.empty.companyNotSpecified"),
    );
}

export function ForwardersTable({ forwarders, onOpenDetails, isLoading = false }) {
    const { t } = useTranslation();

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
            headerName: t("common.fields.company"),
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
            headerName: t("common.fields.bin"),
            width: 160,
            cellClassName: 'tabular-nums',
            valueGetter: (_, row) => getForwarderSortValue(getForwarderBin(row)),
            renderCell: ({ row }) => <Box>{getForwarderBin(row)}</Box>,
        },
        {
            field: 'iin',
            headerName: t("common.fields.iin"),
            width: 160,
            cellClassName: 'tabular-nums',
            valueGetter: (_, row) => getForwarderSortValue(getForwarderIin(row)),
            renderCell: ({ row }) => <Box>{getForwarderIin(row)}</Box>,
        },
        {
            field: 'fio',
            headerName: t("forwarders.representative"),
            width: 220,
            valueGetter: (_, row) => getForwarderSortValue(getForwarderFio(row)),
            renderCell: ({ row }) => <Box>{getForwarderFio(row)}</Box>,
        },
        {
            field: 'phone',
            headerName: t("common.fields.phone"),
            width: 160,
            cellClassName: 'tabular-nums',
            valueGetter: (_, row) => getForwarderSortValue(getForwarderPhone(row)),
            renderCell: ({ row }) => <Box>{getForwarderPhone(row)}</Box>,
        },
        {
            field: 'invite_link',
            headerName: t("forwarders.invite.title"),
            width: 170,
            sortable: false,
            filterable: false,
            renderCell: ({ row }) => (
                <ForwarderInviteLink forwarder={row} compact />
            ),
        },
        {
            field: 'bik',
            headerName: t("common.fields.bik"),
            width: 140,
            cellClassName: 'tabular-nums',
            valueGetter: (_, row) => getForwarderSortValue(getForwarderBik(row)),
            renderCell: ({ row }) => <Box>{getForwarderBik(row)}</Box>,
        },
        {
            field: 'account',
            headerName: t("common.fields.settlementAccount"),
            width: 220,
            cellClassName: 'tabular-nums',
            valueGetter: (_, row) => getForwarderSortValue(getForwarderAccount(row)),
            renderCell: ({ row }) => <Box>{getForwarderAccount(row)}</Box>,
        },
        {
            field: 'address',
            headerName: t("common.fields.companyAddress"),
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
                // Загрузку рисует сама сетка: встроенный скелетон-оверлей строит
               // строки-заглушки по реальным колонкам и их ширине, шапка остаётся
               // видимой.
               loading={isLoading}
               slotProps={{
                  loadingOverlay: {
                     variant: 'skeleton',
                     noRowsVariant: 'skeleton',
                  },
               }}
               rows={forwarders}
                getRowId={(row) => getForwarderId(row)}
                columns={columns}
                getRowClassName={getZebraRowClassName}
                hideFooter
                localeText={{
                    noRowsLabel: t("forwarders.notFound"),
                }}
                sx={{ border: 0 }}
            />
        </Paper>
    );
}

ForwardersTable.propTypes = {
   forwarders: PropTypes.array.isRequired,
   onOpenDetails: PropTypes.func,
   isLoading: PropTypes.bool,
};

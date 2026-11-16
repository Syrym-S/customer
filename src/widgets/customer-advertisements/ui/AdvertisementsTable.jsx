import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Box, Paper, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import { StatusDot } from '../../../shared/ui/StatusDot';
import {
   getZebraRowClassName,
   toSortString,
   toTimestamp,
} from '../../../shared/helpers/data-grid.helpers';
import {
   formatAdvertisementDateTime,
   getAdvertisementLeadNumberLabel,
   getAdvertisementPriceLabel,
   getAdvertisementRouteLabel,
   getAdvertisementStatusColor,
   getAdvertisementStatusLabel,
} from '../model/advertisement.helpers';

export function AdvertisementsTable({
   advertisements,
   isLoading = false,
   onOpen,
}) {
   const { t } = useTranslation();

   const columns = [
      {
         field: 'num',
         headerName: t('advertisements.fields.leadNum'),
         width: 110,
         valueGetter: (_, row) => Number(row?.lead?.num) || 0,
         renderCell: ({ row }) => (
            <Box sx={{ fontWeight: 600 }}>
               {getAdvertisementLeadNumberLabel(row.lead) || '—'}
            </Box>
         ),
      },
      {
         field: 'route',
         headerName: t('advertisements.fields.route'),
         flex: 1,
         minWidth: 240,
         valueGetter: (_, row) => toSortString(getAdvertisementRouteLabel(row?.lead), ''),
         renderCell: ({ row }) => {
            const routeLabel = getAdvertisementRouteLabel(row.lead);

            return (
               <Tooltip title={routeLabel}>
                  <Box
                     sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                     }}
                  >
                     {routeLabel}
                  </Box>
               </Tooltip>
            );
         },
      },
      {
         field: 'firstPointAt',
         headerName: t('advertisements.fields.firstPointAt'),
         width: 170,
         valueGetter: (_, row) => toTimestamp(row?.lead?.firstPointAt),
         renderCell: ({ row }) => (
            <Box>
               {formatAdvertisementDateTime(row.lead?.firstPointAt) || '—'}
            </Box>
         ),
      },
      {
         field: 'price',
         headerName: t('common.fields.price'),
         width: 150,
         valueGetter: (_, row) => Number(row?.lead?.price) || 0,
         renderCell: ({ row }) => (
            <Box>{getAdvertisementPriceLabel(row.lead) || '—'}</Box>
         ),
      },
      {
         field: 'expiredAt',
         headerName: t('advertisements.fields.expiredAt'),
         width: 170,
         valueGetter: (_, row) => toTimestamp(row?.expiredAt),
         renderCell: ({ row }) => (
            <Box>{formatAdvertisementDateTime(row.expiredAt) || '—'}</Box>
         ),
      },
      {
         field: 'status',
         headerName: t('common.fields.status'),
         width: 150,
         valueGetter: (_, row) => getAdvertisementStatusLabel(row),
         renderCell: ({ row }) => (
            <StatusDot
               label={getAdvertisementStatusLabel(row)}
               color={getAdvertisementStatusColor(row)}
            />
         ),
      },
      {
         field: 'createdAt',
         headerName: t('advertisements.fields.createdAt'),
         width: 170,
         valueGetter: (_, row) => toTimestamp(row?.createdAt),
         renderCell: ({ row }) => (
            <Box>{formatAdvertisementDateTime(row.createdAt) || '—'}</Box>
         ),
      },
   ];

   return (
      <Paper sx={{ height: '70vh', my: '10px' }}>
         <DataGrid
            loading={isLoading}
            slotProps={{
               loadingOverlay: {
                  variant: 'skeleton',
                  noRowsVariant: 'skeleton',
               },
            }}
            rows={advertisements}
            getRowId={(row) => row.id}
            columns={columns}
            getRowClassName={getZebraRowClassName}
            onRowClick={({ row }) => onOpen?.(row)}
            hideFooter
            localeText={{ noRowsLabel: t('advertisements.notFound') }}
            sx={{
               border: 0,
               '& .MuiDataGrid-row': { cursor: 'pointer' },
            }}
         />
      </Paper>
   );
}

AdvertisementsTable.propTypes = {
   advertisements: PropTypes.array.isRequired,
   isLoading: PropTypes.bool,
   onOpen: PropTypes.func,
};

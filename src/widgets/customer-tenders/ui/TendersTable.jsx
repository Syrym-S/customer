import { Box, Paper, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useTendersContext } from '../model/useTendersContext';
import {
   getShortLocationLabel,
   getZebraRowClassName,
   toNumberOrNull,
   toSortString,
   truncateId,
} from '../../../shared/helpers/data-grid.helpers';
import { StatusDot } from '../../../shared/ui/StatusDot';
import {
   getTenderCargoTypeLabel,
   getTenderTotalCargoWeight,
   tenderStatusLabels,
   tenderStatusStyles,
} from '../model/tender.helpers';
import { formatAmount } from '../../../shared/helpers/currency-format.helpers';

function getLocationLabel(location) {
   if (!location) {
      return 'Некорректные данные';
   }

   if (typeof location === 'string') {
      return location || 'Некорректные данные';
   }

   return location.address || location.name || location.title || 'Некорректные данные';
}

function getMoneyLabel(amount, currency) {
   const formattedAmount = formatAmount(amount);

   if (!formattedAmount) {
      return '-';
   }

   return `${formattedAmount} ${currency || ''}`.trim();
}

function getLeadValue(tender, field) {
   return tender?.lead?.[field] || tender?.[field] || null;
}

function getTenderPrice(tender) {
   return tender?.summ || tender?.price || tender?.lead?.summ || tender?.lead?.price;
}

function getTenderBetsCount(tender) {
   const betsCount = Number(tender?.bets_count);

   if (Number.isFinite(betsCount) && betsCount > 0) {
      return betsCount;
   }

   return Array.isArray(tender?.bets) ? tender.bets.length : 0;
}

function getTenderShortLocation(tender, field) {
   const location = getLeadValue(tender, field);

   return toSortString(
      getShortLocationLabel(location, getLocationLabel(location)),
      'Некорректные данные',
   );
}

function getTenderTotalWeightSortValue(tender) {
   const totalWeight = getTenderTotalCargoWeight(tender);

   return totalWeight > 0 ? totalWeight : null;
}

function TenderStatusChip({ status }) {
   const label = tenderStatusLabels[status] || status || 'Не указан';
   const styles = tenderStatusStyles[status] || tenderStatusStyles.new;

   return <StatusDot label={label} color={styles.color} />;
}

export function TendersTable({ tenders }) {
   const { openTenderDetails } = useTendersContext();

   const columns = [
      {
         field: 'id',
         headerName: 'ID',
         width: 130,
         renderCell: ({ row }) => (
            <Tooltip title={row.id}>
               <Box
                  onClick={() => openTenderDetails(row)}
                  sx={{
                     color: 'primary.main',
                     cursor: 'pointer',
                     fontWeight: 600,
                     textDecoration: 'underline',
                     textUnderlineOffset: 2,
                     width: 'fit-content',
                  }}
               >
                  {truncateId(row.id)}
               </Box>
            </Tooltip>
         ),
      },
      {
         field: 'status',
         headerName: 'Статус',
         width: 140,
         valueGetter: (_, row) =>
            row?.status ? tenderStatusLabels[row.status] || row.status : '',
         renderCell: ({ row }) => {
            return <TenderStatusChip status={row.status} />;
         },
      },
      {
         field: 'from_location',
         headerName: 'Откуда',
         flex: 1,
         minWidth: 140,
         valueGetter: (_, row) => getTenderShortLocation(row, 'from_location'),
         renderCell: ({ row }) => {
            const location = getLeadValue(row, 'from_location');
            const fullLabel = getLocationLabel(location);

            return (
               <Tooltip title={fullLabel}>
                  <Box>{getShortLocationLabel(location, fullLabel)}</Box>
               </Tooltip>
            );
         },
      },
      {
         field: 'to_location',
         headerName: 'Куда',
         flex: 1,
         minWidth: 140,
         valueGetter: (_, row) => getTenderShortLocation(row, 'to_location'),
         renderCell: ({ row }) => {
            const location = getLeadValue(row, 'to_location');
            const fullLabel = getLocationLabel(location);

            return (
               <Tooltip title={fullLabel}>
                  <Box>{getShortLocationLabel(location, fullLabel)}</Box>
               </Tooltip>
            );
         },
      },
      {
         // Fixed, not flex: its content (a cargo type name, optionally
         // "+ еще N") doesn't benefit from growing, and leaving it in the
         // flex pool was taking a 3rd share of the space that
         // from_location/to_location compete for. Ellipsis + title as a
         // safety net now that it's tighter than the longest possible label.
         field: 'cargoTypes',
         headerName: 'Тип груза',
         width: 160,
         valueGetter: (_, row) =>
            toSortString(getTenderCargoTypeLabel(row), 'Не указан'),
         renderCell: ({ row }) => {
            const label = getTenderCargoTypeLabel(row);

            return (
               <Box
                  title={label}
                  sx={{
                     overflow: 'hidden',
                     textOverflow: 'ellipsis',
                     whiteSpace: 'nowrap',
                  }}
               >
                  {label}
               </Box>
            );
         },
      },
      {
         field: 'cargoTotalWeight',
         headerName: 'Вес грузов',
         width: 120,
         align: 'right',
         headerAlign: 'right',
         cellClassName: 'tabular-nums',
         valueGetter: (_, row) => getTenderTotalWeightSortValue(row),
         renderCell: ({ row }) => {
            const totalWeight = getTenderTotalCargoWeight(row);

            return <Box>{totalWeight > 0 ? `${totalWeight} кг` : '-'}</Box>;
         },
      },
      {
         field: 'price',
         headerName: 'Цена',
         width: 140,
         align: 'right',
         headerAlign: 'right',
         cellClassName: 'tabular-nums',
         valueGetter: (_, row) => toNumberOrNull(getTenderPrice(row)),
         renderCell: ({ row }) => {
            return (
               <Box>
                  {getMoneyLabel(
                     getTenderPrice(row),
                     row.currency || row.lead?.currency,
                  )}
               </Box>
            );
         },
      },
      {
         field: 'bets',
         headerName: 'Ставки',
         width: 70,
         align: 'right',
         headerAlign: 'right',
         cellClassName: 'tabular-nums',
         valueGetter: (_, row) => getTenderBetsCount(row),
         renderCell: ({ row }) => {
            return <Box>{getTenderBetsCount(row)}</Box>;
         },
      },
   ];

   return (
      <Paper sx={{ height: '70vh', my: '10px' }}>
         <DataGrid
            rows={tenders}
            getRowId={(row) => row.id}
            columns={columns}
            getRowClassName={getZebraRowClassName}
            hideFooter
            localeText={{ noRowsLabel: 'Аукционы не найдены' }}
            sx={{ border: 0 }}
         />
      </Paper>
   );
}

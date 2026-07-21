import { Box, Chip, Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useTendersContext } from '../model/useTendersContext';
import {
   getTenderCargoTypeLabel,
   getTenderTotalCargoWeight,
   tenderStatusLabels,
   tenderStatusStyles,
} from '../model/tender.helpers';

function getLocationLabel(location) {
   if (!location) {
      return 'Битые данные';
   }

   if (typeof location === 'string') {
      return location || 'Битые данные';
   }

   return location.address || location.name || location.title || 'Битые данные';
}

function getMoneyLabel(amount, currency) {
   if (amount === null || amount === undefined || amount === '') {
      return '-';
   }

   return `${Number(amount).toLocaleString('ru-RU')} ${currency || ''}`.trim();
}

function getLeadValue(tender, field) {
   return tender?.lead?.[field] || tender?.[field] || null;
}

function TenderStatusChip({ status }) {
   const label = tenderStatusLabels[status] || status || 'Не указан';
   const styles = tenderStatusStyles[status] || tenderStatusStyles.new;

   return (
      <Chip
         label={label}
         variant="outlined"
         size="small"
         sx={{
            borderRadius: 999,
            fontWeight: 600,
            fontSize: {
               xs: '0.7rem',
               sm: '0.8rem',
            },
            ...styles,
         }}
      />
   );
}

export function TendersTable({ tenders }) {
   const { openTenderDetails } = useTendersContext();

   const columns = [
      {
         field: 'id',
         headerName: 'ID',
         width: 200,
         renderCell: ({ row }) => (
            <Box
               sx={{
                  color: 'primary.main',
                  cursor: 'pointer',
               }}
            >
               {row.id}
            </Box>
         ),
      },
      {
         field: 'status',
         headerName: 'Статус',
         width: 180,
         renderCell: ({ row }) => {
            return <TenderStatusChip status={row.status} />;
         },
      },
      {
         field: 'num',
         headerName: 'Номер',
         width: 160,
         renderCell: ({ row }) => {
            return <Box>{row.num || row.lead?.num || '-'}</Box>;
         },
      },
      {
         field: 'from_location',
         headerName: 'Откуда',
         width: 220,
         renderCell: ({ row }) => (
            <Box>{getLocationLabel(getLeadValue(row, 'from_location'))}</Box>
         ),
      },
      {
         field: 'to_location',
         headerName: 'Куда',
         width: 220,
         renderCell: ({ row }) => (
            <Box>{getLocationLabel(getLeadValue(row, 'to_location'))}</Box>
         ),
      },
      {
         field: 'cargoTypes',
         headerName: 'Тип груза',
         width: 220,
         renderCell: ({ row }) => {
            return <Box>{getTenderCargoTypeLabel(row)}</Box>;
         },
      },
      {
         field: 'cargoTotalWeight',
         headerName: 'Вес грузов',
         width: 160,
         renderCell: ({ row }) => {
            const totalWeight = getTenderTotalCargoWeight(row);

            return <Box>{totalWeight > 0 ? `${totalWeight} кг` : '-'}</Box>;
         },
      },
      {
         field: 'price',
         headerName: 'Цена',
         width: 180,
         renderCell: ({ row }) => {
            return (
               <Box>
                  {getMoneyLabel(
                     row.summ || row.price || row.lead?.summ,
                     row.currency || row.lead?.currency,
                  )}
               </Box>
            );
         },
      },
      {
         field: 'bets',
         headerName: 'Ставки',
         width: 140,
         renderCell: ({ row }) => {
            return <Box>{Array.isArray(row.bets) ? row.bets.length : 0}</Box>;
         },
      },
   ];

   return (
      <Paper sx={{ height: '70vh', my: '10px' }}>
         <DataGrid
            rows={tenders}
            getRowId={(row) => row.id}
            columns={columns}
            checkboxSelection
            onRowClick={(params) => {
               openTenderDetails(params.row);
            }}
            sx={{ border: 0 }}
         />
      </Paper>
   );
}

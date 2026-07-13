import { Box, Chip, Paper, Stack } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import {
   formatDate,
   formatMoney,
   getFactoringStatusColor,
   getFactoringStatusLabel,
   getVerificationColor,
   getVerificationLabel,
} from '../model/factorings.helpers';

function getCompanyLabel(company) {
   return company?.company_name || company?.companyName || '-';
}

function getCompanyBin(company) {
   return company?.bin || '-';
}

export function FactoringsTable({ factorings, onOpenDetails }) {
   const columns = [
      {
         field: 'index',
         headerName: '№',
         width: 120,
         renderCell: ({ row }) => (
            <Box
               sx={{
                  color: 'primary.main',
                  cursor: 'pointer',
               }}
            >
               {row.index}
            </Box>
         ),
      },
      {
         field: 'created_at',
         headerName: 'Дата',
         width: 160,
         renderCell: ({ row }) => <Box>{formatDate(row.created_at)}</Box>,
      },
      {
         field: 'factor',
         headerName: 'Фактор',
         width: 220,
         renderCell: ({ row }) => (
            <Stack spacing={0.25}>
               <Box>{getCompanyLabel(row.factor)}</Box>
               <Box sx={{ fontSize: 12, color: 'text.secondary' }}>
                  БИН: {getCompanyBin(row.factor)}
               </Box>
            </Stack>
         ),
      },
      {
         field: 'forwarder',
         headerName: 'Экспедитор',
         width: 240,
         renderCell: ({ row }) => (
            <Stack spacing={0.25}>
               <Box>{getCompanyLabel(row.forwarder)}</Box>

               <Box sx={{ fontSize: 12, color: 'text.secondary' }}>
                  БИН: {getCompanyBin(row.forwarder)}
               </Box>

               {row.forwarder?.fio && (
                  <Box sx={{ fontSize: 12, color: 'text.secondary' }}>
                     {row.forwarder.fio}
                  </Box>
               )}
            </Stack>
         ),
      },
      {
         field: 'deb_summ',
         headerName: 'Дебиторская сумма',
         width: 190,
         renderCell: ({ row }) => (
            <Box>{formatMoney(row.deb_summ, row.deb_currency)}</Box>
         ),
      },
      {
         field: 'cred_summ',
         headerName: 'Кредитная сумма',
         width: 190,
         renderCell: ({ row }) => (
            <Box>{formatMoney(row.cred_summ, row.currency)}</Box>
         ),
      },
      {
         field: 'verified_customer',
         headerName: 'Вы',
         width: 150,
         renderCell: ({ row }) => (
            <Chip
               size="small"
               label={getVerificationLabel(row.verified_customer)}
               color={getVerificationColor(row.verified_customer)}
               sx={{
                  borderRadius: 999,
                  maxWidth: '100%',
                  '& .MuiChip-label': {
                     overflow: 'hidden',
                     textOverflow: 'ellipsis',
                  },
               }}
            />
         ),
      },
      {
         field: 'verified_forwarder',
         headerName: 'Экспедитор',
         width: 170,
         renderCell: ({ row }) => (
            <Chip
               size="small"
               label={getVerificationLabel(row.verified_forwarder)}
               color={getVerificationColor(row.verified_forwarder)}
               variant={row.verified_forwarder ? 'filled' : 'outlined'}
               sx={{
                  borderRadius: 999,
                  maxWidth: '100%',
                  '& .MuiChip-label': {
                     overflow: 'hidden',
                     textOverflow: 'ellipsis',
                  },
               }}
            />
         ),
      },
      {
         field: 'status',
         headerName: 'Статус',
         width: 180,
         renderCell: ({ row }) => (
            <Chip
               size="small"
               label={getFactoringStatusLabel(row.status)}
               color={getFactoringStatusColor(row.status)}
               sx={{ borderRadius: 999 }}
            />
         ),
      },
   ];

   return (
      <Paper sx={{ height: '70vh', my: '10px' }}>
         <DataGrid
            rows={factorings}
            getRowId={(row) => row.index}
            columns={columns}
            checkboxSelection
            onRowClick={(params) => {
               onOpenDetails(params.row);
            }}
            sx={{ border: 0 }}
         />
      </Paper>
   );
}

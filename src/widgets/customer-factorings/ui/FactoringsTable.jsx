import { Box, Paper, Stack, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import { getZebraRowClassName, truncateId } from '../../../shared/helpers/data-grid.helpers';
import { paletteKeyToColorPath } from '../../../shared/helpers/status-color.helpers';
import { StatusDot } from '../../../shared/ui/StatusDot';
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
         width: 130,
         cellClassName: 'tabular-nums',
         renderCell: ({ row }) => {
            const value = row.index ?? row.id ?? '—';

            return (
               <Tooltip title={value}>
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
                     {truncateId(value)}
                  </Box>
               </Tooltip>
            );
         },
      },
      {
         field: 'created_at',
         headerName: 'Дата',
         width: 160,
         cellClassName: 'tabular-nums',
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
         width: 200,
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
         field: 'verified_customer',
         headerName: 'Вы',
         width: 150,
         renderCell: ({ row }) => (
            <StatusDot
               label={getVerificationLabel(row.verified_customer)}
               color={paletteKeyToColorPath(getVerificationColor(row.verified_customer))}
            />
         ),
      },
      {
         field: 'verified_forwarder',
         headerName: 'Экспедитор',
         width: 150,
         renderCell: ({ row }) => (
            <StatusDot
               label={getVerificationLabel(row.verified_forwarder)}
               color={paletteKeyToColorPath(getVerificationColor(row.verified_forwarder))}
            />
         ),
      },
      {
         field: 'status',
         headerName: 'Фактор',
         width: 160,
         renderCell: ({ row }) => (
            <StatusDot
               label={getFactoringStatusLabel(row.status)}
               color={paletteKeyToColorPath(getFactoringStatusColor(row.status))}
            />
         ),
      },
      {
         field: 'deb_summ',
         headerName: 'Дебиторская сумма',
         width: 190,
         align: 'right',
         headerAlign: 'right',
         cellClassName: 'tabular-nums',
         renderCell: ({ row }) => (
            <Box>{formatMoney(row.deb_summ, row.deb_currency)}</Box>
         ),
      },
      {
         field: 'cred_summ',
         headerName: 'Кредитная сумма',
         width: 190,
         align: 'right',
         headerAlign: 'right',
         cellClassName: 'tabular-nums',
         renderCell: ({ row }) => (
            <Box>{formatMoney(row.cred_summ, row.currency)}</Box>
         ),
      },
   ];

   return (
      <Paper sx={{ height: '70vh', my: '10px' }}>
         <DataGrid
            rows={factorings}
            getRowId={(row) => row.id ?? row.index}
            columns={columns}
            getRowClassName={getZebraRowClassName}
            hideFooter
            sx={{ border: 0 }}
         />
      </Paper>
   );
}

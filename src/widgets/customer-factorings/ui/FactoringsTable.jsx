import { Box, Paper, Stack, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import {
   getZebraRowClassName,
   toNumberOrNull,
   toSortString,
   toTimestamp,
   truncateId,
} from '../../../shared/helpers/data-grid.helpers';
import { paletteKeyToColorPath } from '../../../shared/helpers/status-color.helpers';
import { StatusDot } from '../../../shared/ui/StatusDot';
import {
   formatDate,
   formatMoney,
   getFactoringLineTypeColor,
   getFactoringLineTypeLabel,
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
         valueGetter: (_, row) => String(row?.index ?? row?.id ?? ''),
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
         field: 'is_line',
         headerName: 'Тип',
         width: 150,
         valueGetter: (_, row) => getFactoringLineTypeLabel(row?.is_line),
         renderCell: ({ row }) => (
            <StatusDot
               label={getFactoringLineTypeLabel(row.is_line)}
               color={paletteKeyToColorPath(getFactoringLineTypeColor(row.is_line))}
            />
         ),
      },
      {
         field: 'created_at',
         headerName: 'Дата',
         width: 160,
         cellClassName: 'tabular-nums',
         valueGetter: (_, row) => toTimestamp(row?.created_at),
         renderCell: ({ row }) => <Box>{formatDate(row.created_at)}</Box>,
      },
      {
         field: 'status',
         headerName: 'Статус',
         width: 160,
         valueGetter: (_, row) =>
            row?.status ? getFactoringStatusLabel(row.status) : '',
         renderCell: ({ row }) => (
            <StatusDot
               label={getFactoringStatusLabel(row.status)}
               color={paletteKeyToColorPath(getFactoringStatusColor(row.status))}
            />
         ),
      },
      {
         field: 'factor',
         headerName: 'Фактор',
         width: 220,
         valueGetter: (_, row) => toSortString(getCompanyLabel(row?.factor), '-'),
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
         valueGetter: (_, row) =>
            toSortString(getCompanyLabel(row?.forwarder), '-'),
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
         valueGetter: (_, row) => getVerificationLabel(row?.verified_customer),
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
         valueGetter: (_, row) => getVerificationLabel(row?.verified_forwarder),
         renderCell: ({ row }) => (
            <StatusDot
               label={getVerificationLabel(row.verified_forwarder)}
               color={paletteKeyToColorPath(getVerificationColor(row.verified_forwarder))}
            />
         ),
      },
      {
         field: 'verified_factor',
         headerName: 'Фактор',
         width: 150,
         valueGetter: (_, row) => getVerificationLabel(row?.verified_factor),
         renderCell: ({ row }) => (
            <StatusDot
               label={getVerificationLabel(row.verified_factor)}
               color={paletteKeyToColorPath(getVerificationColor(row.verified_factor))}
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
         valueGetter: (_, row) => toNumberOrNull(row?.deb_summ),
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
         valueGetter: (_, row) => toNumberOrNull(row?.cred_summ),
         renderCell: ({ row }) => (
            <Box>{formatMoney(row.cred_summ, row.currency)}</Box>
         ),
      },
      {
         field: 'grace_period_days',
         headerName: 'Отсрочка платежа',
         width: 160,
         valueGetter: (_, row) => row?.grace_period_days ?? null,
         renderCell: ({ row }) => (
            <Box>{row.grace_period_days ? `${row.grace_period_days} дн.` : '-'}</Box>
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
            localeText={{ noRowsLabel: 'Факторинг-покупки не найдены' }}
            sx={{ border: 0 }}
         />
      </Paper>
   );
}

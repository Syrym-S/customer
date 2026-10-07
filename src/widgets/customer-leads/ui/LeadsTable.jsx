import { Box, Paper, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import { useLeadsContext } from '../model/useLeadsContext';
import {
   getDisplayLeadStatusLabel,
   getDisplayLeadStatusStyles,
   isDraftLead,
} from '../model/lead.helpers';
import {
   getShortLocationLabel,
   getZebraRowClassName,
   toSortString,
} from '../../../shared/helpers/data-grid.helpers';
import { StatusDot } from '../../../shared/ui/StatusDot';

function getLocationLabel(location) {
   if (!location) {
      return 'Некорректные данные';
   }

   if (typeof location === 'string') {
      return location || 'Некорректные данные';
   }

   return location.address || location.name || location.title || 'Некорректные данные';
}

function getForwarderLabel(forwarder) {
   return forwarder?.fullName || forwarder?.companyName || '-';
}

function getLocationSortValue(location) {
   return toSortString(
      getShortLocationLabel(location, getLocationLabel(location)),
      'Некорректные данные',
      'Не указано',
   );
}

function getLeadRowClassName(params) {
   if (isDraftLead(params.row)) {
      return 'row-draft';
   }

   return getZebraRowClassName(params);
}

function LeadStatusChip({ lead }) {
   return (
      <StatusDot
         label={getDisplayLeadStatusLabel(lead)}
         color={getDisplayLeadStatusStyles(lead).color}
      />
   );
}

export function LeadsTable({ leads }) {
   const { setOpenLead } = useLeadsContext();

   const columns = [
      {
         field: 'num',
         headerName: '№',
         width: 130,
         renderCell: ({ row }) => (
            <Tooltip title={row.num ?? row.id}>
               <Box
                  onClick={() => setOpenLead(row)}
                  sx={{
                     color: 'primary.main',
                     cursor: 'pointer',
                     fontWeight: 600,
                     textDecoration: 'underline',
                     textUnderlineOffset: 2,
                     width: 'fit-content',
                  }}
               >
                  {row.num ?? row.id}
               </Box>
            </Tooltip>
         ),
      },
      {
         field: 'status',
         headerName: 'Статус',
         width: 180,
         valueGetter: (_, row) => getDisplayLeadStatusLabel(row),
         renderCell: ({ row }) => {
            return <LeadStatusChip lead={row} />;
         },
      },
      {
         field: 'from_location',
         headerName: 'Откуда',
         flex: 1,
         minWidth: 140,
         colSpan: (_value, row) => (isDraftLead(row) ? 3 : undefined),
         valueGetter: (_, row) => getLocationSortValue(row?.from_location),
         renderCell: ({ row }) => {
            if (isDraftLead(row)) {
               return (
                  <Box sx={{ color: 'text.secondary' }}>
                     Данные не заполнены
                  </Box>
               );
            }

            const fullLabel = getLocationLabel(row.from_location);

            return (
               <Tooltip title={fullLabel}>
                  <Box>{getShortLocationLabel(row.from_location, fullLabel)}</Box>
               </Tooltip>
            );
         },
      },
      {
         field: 'to_location',
         headerName: 'Куда',
         flex: 1,
         minWidth: 140,
         valueGetter: (_, row) => getLocationSortValue(row?.to_location),
         renderCell: ({ row }) => {
            const fullLabel = getLocationLabel(row.to_location);

            return (
               <Tooltip title={fullLabel}>
                  <Box>{getShortLocationLabel(row.to_location, fullLabel)}</Box>
               </Tooltip>
            );
         },
      },
      {
         field: 'forwarder',
         headerName: 'Экспедитор',
         flex: 1,
         minWidth: 180,
         valueGetter: (_, row) =>
            toSortString(getForwarderLabel(row?.forwarder), '-', 'Не указан'),
         renderCell: ({ row }) => {
            return <Box>{getForwarderLabel(row.forwarder)}</Box>;
         },
      },
      {
         field: 'grace_period_days',
         headerName: 'Отсрочка платежа',
         width: 160,
         valueGetter: (_, row) => row?.grace_period_days ?? null,
         renderCell: ({ row }) => {
            return (
               <Box>
                  {row.grace_period_days ? `${row.grace_period_days} дн.` : '-'}
               </Box>
            );
         },
      },
   ];

   return (
      <Paper sx={{ height: '70vh', my: '10px' }}>
         <DataGrid
            rows={leads}
            getRowId={(row) => row.id}
            columns={columns}
            getRowClassName={getLeadRowClassName}
            hideFooter
            localeText={{ noRowsLabel: 'Заказы не найдены' }}
            sx={{ border: 0 }}
         />
      </Paper>
   );
}
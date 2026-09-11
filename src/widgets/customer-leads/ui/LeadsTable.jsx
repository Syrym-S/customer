import { Box, Paper, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import { useLeadsContext } from '../model/useLeadsContext';
import { getLeadStatusLabel, getLeadStatusStyles } from '../model/lead.helpers';
import {
   getShortLocationLabel,
   getZebraRowClassName,
   truncateId,
} from '../../../shared/helpers/data-grid.helpers';
import { StatusDot } from '../../../shared/ui/StatusDot';

function getLocationLabel(location) {
   if (!location) {
      return 'Битые данные';
   }

   if (typeof location === 'string') {
      return location || 'Битые данные';
   }

   return location.address || location.name || location.title || 'Битые данные';
}

function getForwarderLabel(forwarder) {
   return forwarder?.fullName || forwarder?.companyName || '-';
}

function LeadStatusChip({ status }) {
   return (
      <StatusDot
         label={getLeadStatusLabel(status)}
         color={getLeadStatusStyles(status).color}
      />
   );
}

export function LeadsTable({ leads }) {
   const { setOpenLead } = useLeadsContext();

   const columns = [
      {
         field: 'id',
         headerName: 'ID',
         width: 130,
         renderCell: ({ row }) => (
            <Tooltip title={row.id}>
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
                  {truncateId(row.id)}
               </Box>
            </Tooltip>
         ),
      },
      {
         field: 'status',
         headerName: 'Статус',
         width: 180,
         renderCell: ({ row }) => {
            return <LeadStatusChip status={row.status} />;
         },
      },
      {
         field: 'from_location',
         headerName: 'Откуда',
         flex: 1,
         minWidth: 140,
         renderCell: ({ row }) => {
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
         renderCell: ({ row }) => {
            return <Box>{getForwarderLabel(row.forwarder)}</Box>;
         },
      },
   ];

   return (
      <Paper sx={{ height: '70vh', my: '10px' }}>
         <DataGrid
            rows={leads}
            getRowId={(row) => row.id}
            columns={columns}
            getRowClassName={getZebraRowClassName}
            hideFooter
            sx={{ border: 0 }}
         />
      </Paper>
   );
}
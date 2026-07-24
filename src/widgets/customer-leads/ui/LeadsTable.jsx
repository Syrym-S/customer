import { Box, Chip, Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import { useLeadsContext } from '../model/useLeadsContext';
import { getLeadStatusLabel, getLeadStatusStyles } from '../model/lead.helpers';

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
      <Chip
         label={getLeadStatusLabel(status)}
         variant="outlined"
         size="small"
         sx={{
            borderRadius: 999,
            fontWeight: 600,
            fontSize: {
               xs: '0.7rem',
               sm: '0.8rem',
            },
            ...(getLeadStatusStyles(status)),
         }}
      />
   );
}

export function LeadsTable({ leads }) {
   const { setOpenLead } = useLeadsContext();

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
         width: 220,
         renderCell: ({ row }) => {
            return <LeadStatusChip status={row.status} />;
         },
      },
      {
         field: 'from_location',
         headerName: 'Откуда',
         width: 200,
         renderCell: ({ row }) => (
            <Box>{getLocationLabel(row.from_location)}</Box>
         ),
      },
      {
         field: 'to_location',
         headerName: 'Куда',
         width: 200,
         renderCell: ({ row }) => (
            <Box>{getLocationLabel(row.to_location)}</Box>
         ),
      },
      {
         field: 'num',
         headerName: 'Номер',
         width: 200,
      },
      {
         field: 'forwarder',
         headerName: 'Экспедитор',
         width: 200,
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
            checkboxSelection
            onRowClick={(params) => {
               setOpenLead(params.row);
            }}
            sx={{ border: 0 }}
         />
      </Paper>
   );
}
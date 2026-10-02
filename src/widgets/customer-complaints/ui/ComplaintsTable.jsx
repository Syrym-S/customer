import PropTypes from 'prop-types';
import { Box, Paper, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import { StatusDot } from '../../../shared/ui/StatusDot';
import { formatDate } from '../../customer-factorings/model/factorings.helpers';
import {
   getZebraRowClassName,
   toSortString,
   toTimestamp,
} from '../../../shared/helpers/data-grid.helpers';
import { useComplaintsContext } from '../model/useComplaintsContext';
import {
   getComplaintResponseLabel,
   getComplaintStatusColor,
   getComplaintStatusLabel,
   getComplaintTargetLabel,
   getComplaintTargetTypeLabel,
} from '../model/complaints.helpers';

function truncate(text, maxLength = 80) {
   if (!text || text.length <= maxLength) {
      return text || '';
   }

   return `${text.slice(0, maxLength).trimEnd()}…`;
}

function ComplaintStatusChip({ complaint }) {
   return (
      <StatusDot
         label={getComplaintStatusLabel(complaint)}
         color={getComplaintStatusColor(complaint)}
      />
   );
}

ComplaintStatusChip.propTypes = {
   complaint: PropTypes.shape({
      final_status: PropTypes.oneOf(['completed', 'rejected', null]),
      acceptance_at: PropTypes.string,
   }).isRequired,
};

export function ComplaintsTable({ complaints }) {
   const { setOpenComplaint } = useComplaintsContext();

   const columns = [
      {
         field: 'request',
         headerName: 'Жалоба',
         flex: 1,
         minWidth: 220,
         valueGetter: (_, row) => toSortString(row?.request, ''),
         renderCell: ({ row }) => (
            <Tooltip title={row.request || ''}>
               <Box
                  onClick={() => setOpenComplaint(row)}
                  sx={{
                     color: 'primary.main',
                     cursor: 'pointer',
                     fontWeight: 600,
                     textDecoration: 'underline',
                     textUnderlineOffset: 2,
                     overflow: 'hidden',
                     textOverflow: 'ellipsis',
                     whiteSpace: 'nowrap',
                  }}
               >
                  {truncate(row.request)}
               </Box>
            </Tooltip>
         ),
      },
      {
         field: 'target',
         headerName: 'Относится к',
         flex: 1,
         minWidth: 180,
         valueGetter: (_, row) =>
            toSortString(getComplaintTargetLabel(row?.target), ''),
         renderCell: ({ row }) => {
            const targetLabel = getComplaintTargetLabel(row.target);

            if (!targetLabel) {
               return <Box sx={{ color: 'text.secondary' }}>—</Box>;
            }

            return (
               <Tooltip title={targetLabel}>
                  <Box
                     sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                     }}
                  >
                     {getComplaintTargetTypeLabel(row.target)}: {targetLabel}
                  </Box>
               </Tooltip>
            );
         },
      },
      {
         field: 'status',
         headerName: 'Статус',
         width: 190,
         valueGetter: (_, row) => getComplaintStatusLabel(row),
         renderCell: ({ row }) => <ComplaintStatusChip complaint={row} />,
      },
      {
         field: 'response',
         headerName: 'Ответ',
         width: 150,
         valueGetter: (_, row) => getComplaintResponseLabel(row),
         renderCell: ({ row }) => <Box>{getComplaintResponseLabel(row)}</Box>,
      },
      {
         field: 'created_at',
         headerName: 'Дата',
         width: 150,
         valueGetter: (_, row) => toTimestamp(row?.created_at),
         renderCell: ({ row }) => <Box>{formatDate(row.created_at)}</Box>,
      },
   ];

   return (
      <Paper sx={{ height: '70vh', my: '10px' }}>
         <DataGrid
            rows={complaints}
            getRowId={(row) => row.id}
            columns={columns}
            getRowClassName={getZebraRowClassName}
            hideFooter
            localeText={{ noRowsLabel: 'Жалобы не найдены' }}
            sx={{ border: 0 }}
         />
      </Paper>
   );
}

ComplaintsTable.propTypes = {
   complaints: PropTypes.arrayOf(PropTypes.object).isRequired,
};

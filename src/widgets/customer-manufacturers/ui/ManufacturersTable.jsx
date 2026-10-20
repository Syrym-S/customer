import PropTypes from 'prop-types';
import { Box, Button, Paper, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import LinkOffRoundedIcon from '@mui/icons-material/LinkOffRounded';

import {
   getZebraRowClassName,
   toSortString,
   toTimestamp,
} from '../../../shared/helpers/data-grid.helpers';
import { formatLeadDate } from '../../customer-leads/model/lead.helpers';
import {
   getManufacturerBin,
   getManufacturerId,
   getManufacturerLinkedAt,
   getManufacturerName,
} from '../model/manufacturers.helpers';

export function ManufacturersTable({
   manufacturers,
   leadsCounts,
   onOpenDetails,
   onOpenLeads,
   onRemove,
   isSubmitting = false,
}) {
   const columns = [
      {
         field: 'companyName',
         headerName: 'Производитель',
         flex: 1,
         minWidth: 260,
         valueGetter: (_, row) => toSortString(getManufacturerName(row)),
         renderCell: ({ row }) => (
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
               {getManufacturerName(row)}
            </Box>
         ),
      },
      {
         field: 'companyBin',
         headerName: 'БИН',
         width: 170,
         cellClassName: 'tabular-nums',
         valueGetter: (_, row) => toSortString(getManufacturerBin(row), 'Не указан'),
         renderCell: ({ row }) => <Box>{getManufacturerBin(row)}</Box>,
      },
      {
         field: 'linkedAt',
         headerName: 'Привязан',
         width: 190,
         valueGetter: (_, row) => toTimestamp(getManufacturerLinkedAt(row)),
         renderCell: ({ row }) => {
            const linkedAt = getManufacturerLinkedAt(row);

            return <Box>{linkedAt ? formatLeadDate(linkedAt) : '—'}</Box>;
         },
      },
      {
         field: 'leadsCount',
         headerName: 'Перевозок',
         width: 130,
         valueGetter: (_, row) => leadsCounts.get(getManufacturerId(row)) ?? 0,
         renderCell: ({ row }) => {
            const leadsCount = leadsCounts.get(getManufacturerId(row)) ?? 0;

            if (leadsCount === 0) {
               return <Box sx={{ color: 'text.secondary' }}>0</Box>;
            }

            return (
               <Tooltip title="Открыть привязанные перевозки">
                  <Box
                     onClick={() => onOpenLeads(row)}
                     sx={{
                        color: 'primary.main',
                        cursor: 'pointer',
                        fontWeight: 600,
                        textDecoration: 'underline',
                        textUnderlineOffset: 2,
                        width: 'fit-content',
                     }}
                  >
                     {leadsCount}
                  </Box>
               </Tooltip>
            );
         },
      },
      {
         field: 'actions',
         headerName: 'Действия',
         width: 150,
         sortable: false,
         filterable: false,
         renderCell: ({ row }) => (
            <Button
               size="small"
               color="error"
               startIcon={<LinkOffRoundedIcon fontSize="small" />}
               onClick={() => onRemove(row)}
               disabled={isSubmitting}
            >
               Убрать
            </Button>
         ),
      },
   ];

   return (
      <Paper sx={{ height: '70vh', my: '10px' }}>
         <DataGrid
            rows={manufacturers}
            getRowId={(row) => getManufacturerId(row)}
            columns={columns}
            getRowClassName={getZebraRowClassName}
            hideFooter
            localeText={{ noRowsLabel: 'Производители не найдены' }}
            sx={{ border: 0 }}
         />
      </Paper>
   );
}

ManufacturersTable.propTypes = {
   manufacturers: PropTypes.array.isRequired,
   leadsCounts: PropTypes.instanceOf(Map).isRequired,
   onOpenDetails: PropTypes.func.isRequired,
   onOpenLeads: PropTypes.func.isRequired,
   onRemove: PropTypes.func.isRequired,
   isSubmitting: PropTypes.bool,
};

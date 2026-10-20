import PropTypes from 'prop-types';
import { Box, Button, Paper, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import { getZebraRowClassName } from '../../../shared/helpers/data-grid.helpers';
import { StatusDot } from '../../../shared/ui/StatusDot';
import {
   getDisplayLeadStatusLabel,
   getDisplayLeadStatusStyles,
} from '../../customer-leads/model/lead.helpers';

function getLocationLabel(location) {
   if (!location) {
      return 'Некорректные данные';
   }

   if (typeof location === 'string') {
      return location;
   }

   return location.address || location.name || location.title || 'Некорректные данные';
}

export function CompactLeadsGrid({
   leads,
   selectionModel,
   onSelectionModelChange,
   rowActionLabel = '',
   onRowAction,
   isRowActionDisabled = false,
   noRowsLabel = 'Перевозки не найдены',
   height = 320,
}) {
   const columns = [
      {
         field: 'num',
         headerName: '№',
         width: 90,
         renderCell: ({ row }) => <Box>{row.num ?? row.id}</Box>,
      },
      {
         field: 'status',
         headerName: 'Статус',
         width: 160,
         valueGetter: (_, row) => getDisplayLeadStatusLabel(row),
         renderCell: ({ row }) => (
            <StatusDot
               label={getDisplayLeadStatusLabel(row)}
               color={getDisplayLeadStatusStyles(row).color}
            />
         ),
      },
      {
         field: 'route',
         headerName: 'Направление',
         flex: 1,
         minWidth: 200,
         sortable: false,
         renderCell: ({ row }) => {
            const label = `${getLocationLabel(row.from_location)} → ${getLocationLabel(row.to_location)}`;

            return (
               <Tooltip title={label}>
                  <Box
                     sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%',
                     }}
                  >
                     {label}
                  </Box>
               </Tooltip>
            );
         },
      },
   ];

   if (rowActionLabel && onRowAction) {
      columns.push({
         field: 'actions',
         headerName: 'Действия',
         width: 130,
         sortable: false,
         filterable: false,
         renderCell: ({ row }) => (
            <Button
               size="small"
               color="error"
               onClick={() => onRowAction(row)}
               disabled={isRowActionDisabled}
            >
               {rowActionLabel}
            </Button>
         ),
      });
   }

   return (
      <Paper variant="outlined" sx={{ height }}>
         <DataGrid
            rows={leads}
            getRowId={(row) => row.id}
            columns={columns}
            checkboxSelection
            disableRowSelectionOnClick
            rowSelectionModel={selectionModel}
            onRowSelectionModelChange={onSelectionModelChange}
            getRowClassName={getZebraRowClassName}
            hideFooter
            density="compact"
            localeText={{ noRowsLabel }}
            sx={{ border: 0 }}
         />
      </Paper>
   );
}

CompactLeadsGrid.propTypes = {
   leads: PropTypes.array.isRequired,
   selectionModel: PropTypes.object.isRequired,
   onSelectionModelChange: PropTypes.func.isRequired,
   rowActionLabel: PropTypes.string,
   onRowAction: PropTypes.func,
   isRowActionDisabled: PropTypes.bool,
   noRowsLabel: PropTypes.string,
   height: PropTypes.number,
};

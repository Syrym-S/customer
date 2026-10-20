import PropTypes from 'prop-types';
import { Box, Button, Paper, Stack, Tooltip } from '@mui/material';
import { DataGrid, GRID_CHECKBOX_SELECTION_COL_DEF } from '@mui/x-data-grid';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import LinkOffRoundedIcon from '@mui/icons-material/LinkOffRounded';

import {
   getZebraRowClassName,
   toSortString,
} from '../../../shared/helpers/data-grid.helpers';
import { StatusDot } from '../../../shared/ui/StatusDot';
import {
   getDisplayLeadStatusLabel,
   getDisplayLeadStatusStyles,
} from '../../customer-leads/model/lead.helpers';
import {
   getLeadManufacturerName,
   hasAttachedManufacturer,
} from '../model/manufacturers.helpers';

function getLocationLabel(location) {
   if (!location) {
      return 'Некорректные данные';
   }

   if (typeof location === 'string') {
      return location;
   }

   return location.address || location.name || location.title || 'Некорректные данные';
}

export function ManufacturerLeadsTable({
   leads,
   selectionModel,
   onSelectionModelChange,
   onOpenLead,
   onAttachLead,
   onDetachLead,
   isSubmitting = false,
}) {
   const columns = [
      {
         field: 'num',
         headerName: '№',
         width: 110,
         renderCell: ({ row }) => (
            <Tooltip title={row.num ?? row.id}>
               <Box
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
         width: 170,
         valueGetter: (_, row) => getDisplayLeadStatusLabel(row),
         renderCell: ({ row }) => (
            <StatusDot
               label={getDisplayLeadStatusLabel(row)}
               color={getDisplayLeadStatusStyles(row).color}
            />
         ),
      },
      {
         field: 'from_location',
         headerName: 'Откуда',
         flex: 1,
         minWidth: 140,
         valueGetter: (_, row) => getLocationLabel(row?.from_location),
         renderCell: ({ row }) => {
            const label = getLocationLabel(row.from_location);

            return (
               <Tooltip title={label}>
                  <Box>{label}</Box>
               </Tooltip>
            );
         },
      },
      {
         field: 'to_location',
         headerName: 'Куда',
         flex: 1,
         minWidth: 140,
         valueGetter: (_, row) => getLocationLabel(row?.to_location),
         renderCell: ({ row }) => {
            const label = getLocationLabel(row.to_location);

            return (
               <Tooltip title={label}>
                  <Box>{label}</Box>
               </Tooltip>
            );
         },
      },
      {
         field: 'manufacturer',
         headerName: 'Производитель',
         flex: 1,
         minWidth: 220,
         valueGetter: (_, row) => toSortString(getLeadManufacturerName(row)),
         renderCell: ({ row }) =>
            hasAttachedManufacturer(row) ? (
               <Box>{getLeadManufacturerName(row)}</Box>
            ) : (
               <Box sx={{ color: 'text.secondary' }}>Не привязан</Box>
            ),
      },
      {
         field: 'actions',
         headerName: 'Действия',
         width: 190,
         sortable: false,
         filterable: false,
         renderCell: ({ row }) => (
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
               <Button
                  size="small"
                  startIcon={<LinkRoundedIcon fontSize="small" />}
                  onClick={() => onAttachLead(row)}
                  disabled={isSubmitting}
               >
                  {hasAttachedManufacturer(row) ? 'Изменить' : 'Привязать'}
               </Button>

               {hasAttachedManufacturer(row) && (
                  <Tooltip title="Открепить производителя">
                     <span>
                        <Button
                           size="small"
                           color="error"
                           onClick={() => onDetachLead(row)}
                           disabled={isSubmitting}
                           sx={{ minWidth: 36, px: 1 }}
                        >
                           <LinkOffRoundedIcon fontSize="small" />
                        </Button>
                     </span>
                  </Tooltip>
               )}
            </Stack>
         ),
      },
   ];

   function handleCellClick({ field, row }) {
      if (
         field === GRID_CHECKBOX_SELECTION_COL_DEF.field ||
         field === 'actions'
      ) {
         return;
      }

      onOpenLead(row);
   }

   return (
      <Paper sx={{ height: '70vh', my: '10px' }}>
         <DataGrid
            rows={leads}
            getRowId={(row) => row.id}
            columns={columns}
            checkboxSelection
            disableRowSelectionOnClick
            keepNonExistentRowsSelected
            rowSelectionModel={selectionModel}
            onRowSelectionModelChange={onSelectionModelChange}
            onCellClick={handleCellClick}
            getRowClassName={getZebraRowClassName}
            hideFooter
            localeText={{ noRowsLabel: 'Перевозки не найдены' }}
            sx={{ border: 0 }}
         />
      </Paper>
   );
}

ManufacturerLeadsTable.propTypes = {
   leads: PropTypes.array.isRequired,
   selectionModel: PropTypes.object.isRequired,
   onSelectionModelChange: PropTypes.func.isRequired,
   onOpenLead: PropTypes.func.isRequired,
   onAttachLead: PropTypes.func.isRequired,
   onDetachLead: PropTypes.func.isRequired,
   isSubmitting: PropTypes.bool,
};

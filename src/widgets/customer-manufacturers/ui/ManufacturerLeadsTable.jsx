import PropTypes from 'prop-types';
import i18n from '../../../shared/i18n';
import { useTranslation } from "react-i18next";
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
      return i18n.t("common.empty.invalidData");
   }

   if (typeof location === 'string') {
      return location;
   }

   return location.address || location.name || location.title || i18n.t("common.empty.invalidData");
}

export function ManufacturerLeadsTable({
   leads,
   selectionModel,
   onSelectionModelChange,
   onOpenLead,
   onAttachLead,
   onDetachLead,
   isSubmitting = false,
   isLoading = false,
}) {
   const { t } = useTranslation();

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
         headerName: t("common.fields.status"),
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
         headerName: t("common.fields.origin"),
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
         headerName: t("common.fields.destination"),
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
         headerName: t("common.fields.manufacturer"),
         flex: 1,
         minWidth: 220,
         valueGetter: (_, row) => toSortString(getLeadManufacturerName(row)),
         renderCell: ({ row }) =>
            hasAttachedManufacturer(row) ? (
               <Box>{getLeadManufacturerName(row)}</Box>
            ) : (
               <Box sx={{ color: 'text.secondary' }}>{t("manufacturers.filters.notLinked")}</Box>
            ),
      },
      {
         field: 'actions',
         headerName: t("common.fields.actions"),
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
                  {hasAttachedManufacturer(row) ? t("common.actions.edit") : t("manufacturers.link.action")}
               </Button>

               {hasAttachedManufacturer(row) && (
                  <Tooltip title={t("manufacturers.unlink.manufacturerAction")}>
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
            // Загрузку рисует сама сетка: встроенный скелетон-оверлей строит
            // строки-заглушки по реальным колонкам и их ширине, шапка остаётся
            // видимой.
            loading={isLoading}
            slotProps={{
               loadingOverlay: {
                  variant: 'skeleton',
                  noRowsVariant: 'skeleton',
               },
            }}
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
            localeText={{ noRowsLabel: t("manufacturers.shipments.notFound") }}
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
   isLoading: PropTypes.bool,
};

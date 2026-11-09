import PropTypes from 'prop-types';
import { useTranslation } from "react-i18next";
import { Box, Button, Chip, Paper, Stack, Tooltip } from '@mui/material';
import { DataGrid, GRID_CHECKBOX_SELECTION_COL_DEF } from '@mui/x-data-grid';
import LinkOffRoundedIcon from '@mui/icons-material/LinkOffRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';

import {
   getZebraRowClassName,
   toSortString,
   toTimestamp,
} from '../../../shared/helpers/data-grid.helpers';
import { formatLeadDate } from '../../customer-leads/model/lead.helpers';
import {
   MANUFACTURER_ROW_STATUSES,
   getManufacturerBin,
   getManufacturerId,
   getManufacturerLinkedAt,
   getManufacturerName,
   getManufacturerRowStatus,
   getManufacturerRowStatusColor,
   getManufacturerRowStatusLabel,
} from '../model/manufacturers.helpers';

export function ManufacturersTable({
   manufacturers,
   leadsCounts,
   selectionModel,
   onSelectionModelChange,
   onOpenDetails,
   onOpenLeads,
   onRemove,
   onApprove,
   onReject,
   onWithdraw,
   isSubmitting = false,
   isLoading = false,
}) {
   const { t } = useTranslation();

   const columns = [
      {
         field: 'companyName',
         headerName: t("common.fields.manufacturer"),
         flex: 1,
         minWidth: 260,
         valueGetter: (_, row) => toSortString(getManufacturerName(row)),
         renderCell: ({ row }) => {
            if (
               getManufacturerRowStatus(row) !== MANUFACTURER_ROW_STATUSES.LINKED
            ) {
               return <Box sx={{ fontWeight: 600 }}>{getManufacturerName(row)}</Box>;
            }

            return (
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
            );
         },
      },
      {
         field: 'companyBin',
         headerName: t("common.fields.bin"),
         width: 170,
         cellClassName: 'tabular-nums',
         valueGetter: (_, row) => toSortString(getManufacturerBin(row), t("common.empty.notSpecifiedM")),
         renderCell: ({ row }) => <Box>{getManufacturerBin(row)}</Box>,
      },
      {
         field: 'rowStatus',
         headerName: t("common.fields.status"),
         width: 180,
         valueGetter: (_, row) =>
            getManufacturerRowStatusLabel(getManufacturerRowStatus(row)),
         renderCell: ({ row }) => {
            const status = getManufacturerRowStatus(row);

            return (
               <Chip
                  size="small"
                  variant="outlined"
                  color={getManufacturerRowStatusColor(status)}
                  label={getManufacturerRowStatusLabel(status)}
               />
            );
         },
      },
      {
         field: 'linkedAt',
         headerName: t("common.fields.date"),
         width: 190,
         valueGetter: (_, row) => toTimestamp(getManufacturerLinkedAt(row)),
         renderCell: ({ row }) => {
            const linkedAt = getManufacturerLinkedAt(row);

            return <Box>{linkedAt ? formatLeadDate(linkedAt) : '—'}</Box>;
         },
      },
      {
         field: 'leadsCount',
         headerName: t("manufacturers.card.shipmentsLabel"),
         width: 130,
         valueGetter: (_, row) => leadsCounts.get(getManufacturerId(row)) ?? 0,
         renderCell: ({ row }) => {
            const leadsCount = leadsCounts.get(getManufacturerId(row)) ?? 0;

            if (leadsCount === 0) {
               return <Box sx={{ color: 'text.secondary' }}>0</Box>;
            }

            return (
               <Tooltip title={t("manufacturers.card.openLinkedShipments")}>
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
         headerName: t("common.fields.actions"),
         width: 240,
         sortable: false,
         filterable: false,
         renderCell: ({ row }) => {
            const status = getManufacturerRowStatus(row);
            const manufacturerId = getManufacturerId(row);

            if (status === MANUFACTURER_ROW_STATUSES.INCOMING) {
               return (
                  <Stack direction="row" spacing={0.5}>
                     <Button
                        size="small"
                        color="success"
                        startIcon={<CheckRoundedIcon fontSize="small" />}
                        onClick={() => onApprove([manufacturerId])}
                        disabled={isSubmitting}
                     >
                        {t("manufacturers.requests.approve")}
                     </Button>

                     <Button
                        size="small"
                        color="error"
                        startIcon={<CloseRoundedIcon fontSize="small" />}
                        onClick={() => onReject([manufacturerId])}
                        disabled={isSubmitting}
                     >
                        {t("manufacturers.requests.reject")}
                     </Button>
                  </Stack>
               );
            }

            if (status === MANUFACTURER_ROW_STATUSES.OUTGOING) {
               return (
                  <Button
                     size="small"
                     color="error"
                     startIcon={<UndoRoundedIcon fontSize="small" />}
                     onClick={() => onWithdraw([manufacturerId])}
                     disabled={isSubmitting}
                  >
                     {t("manufacturers.requests.withdraw")}
                  </Button>
               );
            }

            return (
               <Button
                  size="small"
                  color="error"
                  startIcon={<LinkOffRoundedIcon fontSize="small" />}
                  onClick={() => onRemove(row)}
                  disabled={isSubmitting}
               >
                  {t("common.actions.remove")}
               </Button>
            );
         },
      },
   ];

   function handleCellClick({ field, row }) {
      if (
         field === GRID_CHECKBOX_SELECTION_COL_DEF.field ||
         field === 'actions' ||
         field === 'leadsCount'
      ) {
         return;
      }

      if (getManufacturerRowStatus(row) === MANUFACTURER_ROW_STATUSES.LINKED) {
         onOpenDetails(row);
      }
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
            rows={manufacturers}
            getRowId={(row) => getManufacturerId(row)}
            columns={columns}
            checkboxSelection
            disableRowSelectionOnClick
            keepNonExistentRowsSelected
            rowSelectionModel={selectionModel}
            onRowSelectionModelChange={onSelectionModelChange}
            onCellClick={handleCellClick}
            getRowClassName={getZebraRowClassName}
            hideFooter
            localeText={{ noRowsLabel: t("manufacturers.notFound") }}
            sx={{ border: 0 }}
         />
      </Paper>
   );
}

ManufacturersTable.propTypes = {
   manufacturers: PropTypes.array.isRequired,
   leadsCounts: PropTypes.instanceOf(Map).isRequired,
   selectionModel: PropTypes.object.isRequired,
   onSelectionModelChange: PropTypes.func.isRequired,
   onOpenDetails: PropTypes.func.isRequired,
   onOpenLeads: PropTypes.func.isRequired,
   onRemove: PropTypes.func.isRequired,
   onApprove: PropTypes.func.isRequired,
   onReject: PropTypes.func.isRequired,
   onWithdraw: PropTypes.func.isRequired,
   isSubmitting: PropTypes.bool,
   isLoading: PropTypes.bool,
};

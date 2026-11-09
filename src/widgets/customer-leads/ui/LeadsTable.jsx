import PropTypes from 'prop-types';
import { Box, Paper, Tooltip } from '@mui/material';
import i18n from '../../../shared/i18n';
import { useTranslation } from "react-i18next";
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
      return i18n.t("common.empty.invalidData");
   }

   if (typeof location === 'string') {
      return location || i18n.t("common.empty.invalidData");
   }

   return location.address || location.name || location.title || i18n.t("common.empty.invalidData");
}

function getForwarderLabel(forwarder) {
   return forwarder?.fullName || forwarder?.companyName || '-';
}

function getLocationSortValue(location) {
   return toSortString(
      getShortLocationLabel(location, getLocationLabel(location)),
      i18n.t("common.empty.invalidData"),
      i18n.t("common.empty.notSpecifiedN"),
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

export function LeadsTable({ leads, isLoading = false }) {
   const { t } = useTranslation();

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
         headerName: t("common.fields.status"),
         width: 180,
         valueGetter: (_, row) => getDisplayLeadStatusLabel(row),
         renderCell: ({ row }) => {
            return <LeadStatusChip lead={row} />;
         },
      },
      {
         field: 'from_location',
         headerName: t("common.fields.origin"),
         flex: 1,
         minWidth: 140,
         colSpan: (_value, row) => (isDraftLead(row) ? 3 : undefined),
         valueGetter: (_, row) => getLocationSortValue(row?.from_location),
         renderCell: ({ row }) => {
            if (isDraftLead(row)) {
               return (
                  <Box sx={{ color: 'text.secondary' }}>
                     {t("common.empty.dataNotFilled")}
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
         headerName: t("common.fields.destination"),
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
         headerName: t("enums.participantType.forwarder"),
         flex: 1,
         minWidth: 180,
         valueGetter: (_, row) =>
            toSortString(getForwarderLabel(row?.forwarder), '-', t("common.empty.notSpecifiedM")),
         renderCell: ({ row }) => {
            return <Box>{getForwarderLabel(row.forwarder)}</Box>;
         },
      },
      {
         field: 'grace_period_days',
         headerName: t("common.fields.gracePeriod"),
         width: 160,
         valueGetter: (_, row) => row?.grace_period_days ?? null,
         renderCell: ({ row }) => {
            return (
               <Box>
                  {row.grace_period_days ? t("common.units.days", { count: row.grace_period_days }) : '-'}
               </Box>
            );
         },
      },
   ];

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
            getRowClassName={getLeadRowClassName}
            hideFooter
            localeText={{ noRowsLabel: t("leads.notFound") }}
            sx={{ border: 0 }}
         />
      </Paper>
   );
}

LeadsTable.propTypes = {
   leads: PropTypes.array.isRequired,
   isLoading: PropTypes.bool,
};

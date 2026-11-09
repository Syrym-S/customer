import PropTypes from 'prop-types';
import { Box, Paper, Tooltip } from '@mui/material';
import i18n from '../../../shared/i18n';
import { useTranslation } from "react-i18next";
import { DataGrid } from '@mui/x-data-grid';
import { useTendersContext } from '../model/useTendersContext';
import {
   getShortLocationLabel,
   getZebraRowClassName,
   toNumberOrNull,
   toSortString,
   truncateId,
} from '../../../shared/helpers/data-grid.helpers';
import { StatusDot } from '../../../shared/ui/StatusDot';
import {
   getTenderCargoTypeLabel,
   getTenderTotalCargoWeight,
   getTenderStatusLabel,
   tenderStatusStyles,
} from '../model/tender.helpers';
import { formatAmount } from '../../../shared/helpers/currency-format.helpers';

function getLocationLabel(location) {
   if (!location) {
      return i18n.t("common.empty.invalidData");
   }

   if (typeof location === 'string') {
      return location || i18n.t("common.empty.invalidData");
   }

   return location.address || location.name || location.title || i18n.t("common.empty.invalidData");
}

function getMoneyLabel(amount, currency) {
   const formattedAmount = formatAmount(amount);

   if (!formattedAmount) {
      return '-';
   }

   return `${formattedAmount} ${currency || ''}`.trim();
}

function getLeadValue(tender, field) {
   return tender?.lead?.[field] || tender?.[field] || null;
}

function getTenderPrice(tender) {
   return tender?.summ || tender?.price || tender?.lead?.summ || tender?.lead?.price;
}

function getTenderBetsCount(tender) {
   const betsCount = Number(tender?.bets_count);

   if (Number.isFinite(betsCount) && betsCount > 0) {
      return betsCount;
   }

   return Array.isArray(tender?.bets) ? tender.bets.length : 0;
}

function getTenderShortLocation(tender, field) {
   const location = getLeadValue(tender, field);

   return toSortString(
      getShortLocationLabel(location, getLocationLabel(location)),
      i18n.t("common.empty.invalidData"),
   );
}

function getTenderTotalWeightSortValue(tender) {
   const totalWeight = getTenderTotalCargoWeight(tender);

   return totalWeight > 0 ? totalWeight : null;
}

function TenderStatusChip({ status }) {
   const label =
      getTenderStatusLabel(status) || status || i18n.t("common.empty.notSpecifiedM");
   const styles = tenderStatusStyles[status] || tenderStatusStyles.new;

   return <StatusDot label={label} color={styles.color} />;
}

export function TendersTable({ tenders, isLoading = false }) {
   const { t } = useTranslation();

   const { openTenderDetails } = useTendersContext();

   const columns = [
      {
         field: 'id',
         headerName: '№',
         width: 130,
         renderCell: ({ row }) => (
            <Tooltip title={row.id}>
               <Box
                  onClick={() => openTenderDetails(row)}
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
         field: 'name',
         headerName: t("common.fields.name"),
         flex: 1,
         minWidth: 160,
         valueGetter: (_, row) => toSortString(row?.name),
         renderCell: ({ row }) => {
            const name = String(row?.name || '').trim();

            if (!name) {
               return <Box>-</Box>;
            }

            return (
               <Tooltip title={name}>
                  <Box
                     sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                     }}
                  >
                     {name}
                  </Box>
               </Tooltip>
            );
         },
      },
      {
         field: 'status',
         headerName: t("common.fields.status"),
         width: 140,
         valueGetter: (_, row) =>
            row?.status ? getTenderStatusLabel(row.status) || row.status : '',
         renderCell: ({ row }) => {
            return <TenderStatusChip status={row.status} />;
         },
      },
      {
         field: 'from_location',
         headerName: t("common.fields.origin"),
         flex: 1,
         minWidth: 140,
         valueGetter: (_, row) => getTenderShortLocation(row, 'from_location'),
         renderCell: ({ row }) => {
            const location = getLeadValue(row, 'from_location');
            const fullLabel = getLocationLabel(location);

            return (
               <Tooltip title={fullLabel}>
                  <Box>{getShortLocationLabel(location, fullLabel)}</Box>
               </Tooltip>
            );
         },
      },
      {
         field: 'to_location',
         headerName: t("common.fields.destination"),
         flex: 1,
         minWidth: 140,
         valueGetter: (_, row) => getTenderShortLocation(row, 'to_location'),
         renderCell: ({ row }) => {
            const location = getLeadValue(row, 'to_location');
            const fullLabel = getLocationLabel(location);

            return (
               <Tooltip title={fullLabel}>
                  <Box>{getShortLocationLabel(location, fullLabel)}</Box>
               </Tooltip>
            );
         },
      },
      {
         // Fixed, not flex: its content (a cargo type name, optionally
         // "+ еще N") doesn't benefit from growing, and leaving it in the
         // flex pool was taking a 3rd share of the space that
         // from_location/to_location compete for. Ellipsis + title as a
         // safety net now that it's tighter than the longest possible label.
         field: 'cargoTypes',
         headerName: t("common.fields.cargoType"),
         width: 160,
         valueGetter: (_, row) =>
            toSortString(getTenderCargoTypeLabel(row), t("common.empty.notSpecifiedM")),
         renderCell: ({ row }) => {
            const label = getTenderCargoTypeLabel(row);

            return (
               <Box
                  title={label}
                  sx={{
                     overflow: 'hidden',
                     textOverflow: 'ellipsis',
                     whiteSpace: 'nowrap',
                  }}
               >
                  {label}
               </Box>
            );
         },
      },
      {
         field: 'cargoTotalWeight',
         headerName: t("tenders.details.cargoWeight"),
         width: 120,
         align: 'right',
         headerAlign: 'right',
         cellClassName: 'tabular-nums',
         valueGetter: (_, row) => getTenderTotalWeightSortValue(row),
         renderCell: ({ row }) => {
            const totalWeight = getTenderTotalCargoWeight(row);

            return <Box>{totalWeight > 0 ? t("common.units.kg", { value: totalWeight }) : '-'}</Box>;
         },
      },
      {
         field: 'price',
         headerName: t("common.fields.price"),
         width: 140,
         align: 'right',
         headerAlign: 'right',
         cellClassName: 'tabular-nums',
         valueGetter: (_, row) => toNumberOrNull(getTenderPrice(row)),
         renderCell: ({ row }) => {
            return (
               <Box>
                  {getMoneyLabel(
                     getTenderPrice(row),
                     row.currency || row.lead?.currency,
                  )}
               </Box>
            );
         },
      },
      {
         field: 'grace_period_days',
         headerName: t("common.fields.gracePeriod"),
         width: 160,
         valueGetter: (_, row) => getLeadValue(row, 'grace_period_days'),
         renderCell: ({ row }) => {
            const gracePeriodDays = getLeadValue(row, 'grace_period_days');

            return <Box>{gracePeriodDays ? t("common.units.days", { count: gracePeriodDays }) : '-'}</Box>;
         },
      },
      {
         field: 'bets',
         headerName: t("tenders.bids.title"),
         width: 70,
         align: 'right',
         headerAlign: 'right',
         cellClassName: 'tabular-nums',
         valueGetter: (_, row) => getTenderBetsCount(row),
         renderCell: ({ row }) => {
            return <Box>{getTenderBetsCount(row)}</Box>;
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
            rows={tenders}
            getRowId={(row) => row.id}
            columns={columns}
            getRowClassName={getZebraRowClassName}
            hideFooter
            localeText={{ noRowsLabel: t("tenders.notFound") }}
            sx={{ border: 0 }}
         />
      </Paper>
   );
}

TendersTable.propTypes = {
   tenders: PropTypes.array.isRequired,
   isLoading: PropTypes.bool,
};

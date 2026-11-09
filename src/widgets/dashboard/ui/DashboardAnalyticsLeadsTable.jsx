import PropTypes from 'prop-types';
import i18n from '../../../shared/i18n';
import { useTranslation } from "react-i18next";
import { Box, Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import { getZebraRowClassName } from '../../../shared/helpers/data-grid.helpers';
import { formatAmount } from '../../../shared/helpers/currency-format.helpers';

function getColumns() {
   return [
   { field: 'num', headerName: i18n.t("dashboard.analytics.shipmentNumber"), width: 140 },
   {
      field: 'route',
      headerName: i18n.t("common.fields.route"),
      flex: 1,
      minWidth: 240,
      renderCell: ({ row }) => (
         <Box
            title={row.route}
            sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
         >
            {row.route}
         </Box>
      ),
   },
   {
      field: 'sum',
      headerName: i18n.t("common.fields.amount"),
      width: 180,
      cellClassName: 'tabular-nums',
      renderCell: ({ row }) => `${formatAmount(row.sum)} ${row.currency}`,
   },
   ];
}

export function DashboardAnalyticsLeadsTable({
   rows,
   count,
   page,
   perPage,
   loading,
   onPageChange,
}) {
   const { t } = useTranslation();

   return (
      <Paper variant="outlined" sx={{ height: 420 }}>
         <DataGrid
            rows={rows}
            columns={getColumns()}
            getRowId={(row) => row.id}
            // loading здесь был изначально, но без явного variant сетка при
            // повторных загрузках показывала линейный прогресс-бар: скелетон
            // по умолчанию включается только на первой, когда строк ещё нет.
            loading={loading}
            slotProps={{
               loadingOverlay: {
                  variant: 'skeleton',
                  noRowsVariant: 'skeleton',
               },
            }}
            getRowClassName={getZebraRowClassName}
            paginationMode="server"
            rowCount={count}
            paginationModel={{ page: page - 1, pageSize: perPage }}
            pageSizeOptions={[perPage]}
            onPaginationModelChange={(model) => onPageChange(model.page + 1)}
            localeText={{ noRowsLabel: t("dashboard.analytics.noShipmentsPeriod") }}
            sx={{ border: 0 }}
         />
      </Paper>
   );
}

DashboardAnalyticsLeadsTable.propTypes = {
   rows: PropTypes.array.isRequired,
   count: PropTypes.number.isRequired,
   page: PropTypes.number.isRequired,
   perPage: PropTypes.number.isRequired,
   loading: PropTypes.bool,
   onPageChange: PropTypes.func.isRequired,
};

import PropTypes from 'prop-types';
import { Box, Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import { getZebraRowClassName } from '../../../shared/helpers/data-grid.helpers';
import { formatAmount } from '../../../shared/helpers/currency-format.helpers';

const columns = [
   { field: 'num', headerName: '№ перевозки', width: 140 },
   {
      field: 'route',
      headerName: 'Маршрут',
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
      headerName: 'Сумма',
      width: 180,
      cellClassName: 'tabular-nums',
      renderCell: ({ row }) => `${formatAmount(row.sum)} ${row.currency}`,
   },
];

export function DashboardAnalyticsLeadsTable({
   rows,
   count,
   page,
   perPage,
   loading,
   onPageChange,
}) {
   return (
      <Paper variant="outlined" sx={{ height: 420 }}>
         <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row.id}
            loading={loading}
            getRowClassName={getZebraRowClassName}
            paginationMode="server"
            rowCount={count}
            paginationModel={{ page: page - 1, pageSize: perPage }}
            pageSizeOptions={[perPage]}
            onPaginationModelChange={(model) => onPageChange(model.page + 1)}
            localeText={{ noRowsLabel: 'Нет перевозок за выбранный период' }}
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

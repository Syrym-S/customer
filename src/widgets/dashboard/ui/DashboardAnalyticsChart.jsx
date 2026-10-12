import PropTypes from 'prop-types';
import { Box, Paper, Tab, Tabs, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { BarChart } from '@mui/x-charts/BarChart';

import { formatAmount } from '../../../shared/helpers/currency-format.helpers';
import { STATS_VIEW_MODE_SUM } from './DashboardStatsViewToggle';

export function DashboardAnalyticsChart({
   currencies,
   selectedCurrency,
   onSelectCurrency,
   viewMode,
}) {
   const theme = useTheme();

   if (!currencies.length) {
      return null;
   }

   const activeCurrency =
      currencies.find((item) => item.currency === selectedCurrency) ?? currencies[0];
   const isSumMode = viewMode === STATS_VIEW_MODE_SUM;
   const buckets = activeCurrency.buckets;

   if (!buckets.length) {
      return null;
   }

   return (
      <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
         <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2">Динамика перевозок</Typography>

            {currencies.length > 1 && (
               <Tabs
                  value={activeCurrency.currency}
                  onChange={(_event, value) => onSelectCurrency(value)}
                  sx={{ minHeight: 32 }}
               >
                  {currencies.map((currency) => (
                     <Tab
                        key={currency.currency}
                        value={currency.currency}
                        label={currency.currency}
                        sx={{ minHeight: 32, py: 0, fontSize: 13 }}
                     />
                  ))}
               </Tabs>
            )}
         </Box>

         <BarChart
            height={260}
            xAxis={[{ data: buckets.map((bucket) => bucket.key), scaleType: 'band' }]}
            series={[
               {
                  data: buckets.map((bucket) => (isSumMode ? bucket.sum : bucket.count)),
                  label: isSumMode ? `Сумма, ${activeCurrency.currency}` : 'Количество',
                  color: theme.palette.primary.main,
                  valueFormatter: (value) => (isSumMode ? formatAmount(value) : String(value)),
               },
            ]}
         />
      </Paper>
   );
}

DashboardAnalyticsChart.propTypes = {
   currencies: PropTypes.arrayOf(
      PropTypes.shape({
         currency: PropTypes.string.isRequired,
         buckets: PropTypes.array.isRequired,
      }),
   ).isRequired,
   selectedCurrency: PropTypes.string,
   onSelectCurrency: PropTypes.func.isRequired,
   viewMode: PropTypes.string.isRequired,
};

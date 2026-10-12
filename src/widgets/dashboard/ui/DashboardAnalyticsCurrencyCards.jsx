import PropTypes from 'prop-types';
import { Box, Paper, Skeleton, Typography } from '@mui/material';

import { formatAmount } from '../../../shared/helpers/currency-format.helpers';
import { calcDeltaValue } from '../model/analytics.helpers';
import { STATS_VIEW_MODE_SUM } from './DashboardStatsViewToggle';
import { DashboardAnalyticsDelta } from './DashboardAnalyticsDelta';

export function DashboardAnalyticsCurrencyCards({ currencies, previous, viewMode, loading }) {
   if (loading) {
      return (
         <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {[0, 1].map((key) => (
               <Skeleton key={key} variant="rounded" width={180} height={92} />
            ))}
         </Box>
      );
   }

   if (!currencies.length) {
      return (
         <Typography color="text.disabled" sx={{ fontSize: 14 }}>
            Нет данных за выбранный период
         </Typography>
      );
   }

   return (
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
         {currencies.map((currency) => {
            const previousCurrency = previous?.currencies?.find(
               (item) => item.currency === currency.currency,
            );
            const isSumMode = viewMode === STATS_VIEW_MODE_SUM;
            const value = isSumMode ? currency.sum : currency.count;
            const previousValue = isSumMode ? previousCurrency?.sum : previousCurrency?.count;
            const delta = previous ? calcDeltaValue(value, previousValue) : null;

            return (
               <Paper key={currency.currency} variant="outlined" sx={{ p: 2, minWidth: 180 }}>
                  <Typography color="text.secondary" sx={{ fontSize: 13, fontWeight: 500 }}>
                     {currency.currency}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75, mt: 0.5 }}>
                     <Typography
                        sx={(theme) => ({
                           ...theme.typography.tabularNums,
                           fontSize: 26,
                           fontWeight: 700,
                        })}
                     >
                        {formatAmount(value)}
                     </Typography>

                     {isSumMode ? null : (
                        <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                           рейсов
                        </Typography>
                     )}

                     <DashboardAnalyticsDelta delta={delta} />
                  </Box>

                  {currency.emergencyCount > 0 && (
                     <Typography color="warning.main" sx={{ fontSize: 12, mt: 0.5 }}>
                        Аварийных: {currency.emergencyCount}
                     </Typography>
                  )}
               </Paper>
            );
         })}
      </Box>
   );
}

DashboardAnalyticsCurrencyCards.propTypes = {
   currencies: PropTypes.arrayOf(
      PropTypes.shape({
         currency: PropTypes.string.isRequired,
         count: PropTypes.number,
         sum: PropTypes.number,
         emergencyCount: PropTypes.number,
      }),
   ).isRequired,
   previous: PropTypes.shape({
      currencies: PropTypes.array,
   }),
   viewMode: PropTypes.string.isRequired,
   loading: PropTypes.bool,
};

import PropTypes from 'prop-types';
import { Box, Paper, Skeleton, Typography } from '@mui/material';

import { pluralizeRu } from '../../../shared/helpers/plural.helpers';
import { formatAmount } from '../../../shared/helpers/currency-format.helpers';
import { DashboardStatCurrencies } from './DashboardStatCurrencies';

const CARD_HEIGHT = 140;
const HEADER_HEIGHT = 24;

export function DashboardStatCard({
   label,
   unitForms,
   section,
   showSums,
   loading,
   refreshing,
   action,
   sx,
}) {
   const count = section?.count ?? 0;
   const currencies = section?.currencies ?? [];

   return (
      <Paper
         variant="outlined"
         aria-busy={refreshing}
         sx={{
            height: CARD_HEIGHT,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minWidth: 0,
            opacity: refreshing ? 0.5 : 1,
            pointerEvents: refreshing ? 'none' : 'auto',
            transition: 'opacity 0.2s ease',
            ...sx,
         }}
      >
         <Box sx={{ minWidth: 0 }}>
            <Box
               sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                  minHeight: HEADER_HEIGHT,
                  minWidth: 0,
               }}
            >
               <Typography
                  noWrap
                  color="text.secondary"
                  sx={{ fontSize: 13, fontWeight: 500, lineHeight: '18px' }}
                  title={label}
               >
                  {label}
               </Typography>

               {action}
            </Box>

            {loading ? (
               <Skeleton
                  variant="rounded"
                  width={72}
                  height={32}
                  sx={{ mt: 0.75 }}
               />
            ) : (
               <Box
                  sx={{
                     display: 'flex',
                     alignItems: 'baseline',
                     gap: 0.75,
                     mt: 0.5,
                     minWidth: 0,
                  }}
               >
                  <Typography
                     sx={(theme) => ({
                        ...theme.typography.tabularNums,
                        fontSize: 30,
                        fontWeight: 700,
                        lineHeight: '38px',
                        letterSpacing: '-0.02em',
                     })}
                  >
                     {formatAmount(count)}
                  </Typography>

                  <Typography
                     noWrap
                     color="text.secondary"
                     sx={{ fontSize: 13, minWidth: 0 }}
                  >
                     {pluralizeRu(count, unitForms)}
                  </Typography>
               </Box>
            )}
         </Box>

         <Box sx={{ minHeight: 40 }}>
            {showSums &&
               (loading ? (
                  <>
                     <Skeleton variant="text" width="70%" height={20} />
                     <Skeleton variant="text" width="50%" height={20} />
                  </>
               ) : (
                  <DashboardStatCurrencies currencies={currencies} />
               ))}
         </Box>
      </Paper>
   );
}

DashboardStatCard.propTypes = {
   label: PropTypes.string.isRequired,
   unitForms: PropTypes.arrayOf(PropTypes.string).isRequired,
   section: PropTypes.shape({
      count: PropTypes.number,
      currencies: PropTypes.array,
   }),
   showSums: PropTypes.bool,
   loading: PropTypes.bool,
   refreshing: PropTypes.bool,
   action: PropTypes.node,
   sx: PropTypes.object,
};

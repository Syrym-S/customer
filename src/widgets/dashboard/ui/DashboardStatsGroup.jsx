import PropTypes from 'prop-types';
import { Box, Chip, Typography } from '@mui/material';

import { DashboardStatCard } from './DashboardStatCard';

export function DashboardStatsGroup({
   group,
   data,
   loading,
   periodLabel,
   rangeLabel,
}) {
   const spanLastCard = group.cards.length % 2 === 1;
   const caption = group.periodDependent ? rangeLabel : group.caption;

   return (
      <Box sx={{ minWidth: 0 }}>
         <Box
            sx={{
               display: 'flex',
               alignItems: 'center',
               flexWrap: 'wrap',
               columnGap: 1,
               rowGap: 0.25,
               minHeight: 28,
               mb: 1,
            }}
         >
            <Typography variant="subtitle1">{group.title}</Typography>

            {group.periodDependent && (
               <Chip
                  size="small"
                  color="primary"
                  variant="outlined"
                  label={periodLabel}
                  sx={{ height: 24, fontWeight: 600 }}
               />
            )}

            {caption && (
               <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                  {caption}
               </Typography>
            )}
         </Box>

         <Box
            sx={{
               display: 'grid',
               gap: 2,
               gridTemplateColumns: {
                  xs: 'minmax(0, 1fr)',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  lg: `repeat(${group.columns}, minmax(0, 1fr))`,
               },
            }}
         >
            {group.cards.map((card, index) => {
               const isLast = index === group.cards.length - 1;

               return (
                  <DashboardStatCard
                     key={card.id}
                     label={card.label}
                     unitForms={card.unitForms}
                     showSums={card.showSums}
                     section={data?.[card.sectionKey]}
                     loading={loading}
                     sx={
                        spanLastCard && isLast
                           ? { gridColumn: { xs: 'auto', sm: '1 / -1', lg: 'auto' } }
                           : undefined
                     }
                  />
               );
            })}
         </Box>
      </Box>
   );
}

DashboardStatsGroup.propTypes = {
   group: PropTypes.shape({
      title: PropTypes.string.isRequired,
      caption: PropTypes.string,
      periodDependent: PropTypes.bool,
      columns: PropTypes.number.isRequired,
      cards: PropTypes.array.isRequired,
   }).isRequired,
   data: PropTypes.object,
   loading: PropTypes.bool,
   periodLabel: PropTypes.string,
   rangeLabel: PropTypes.string,
};

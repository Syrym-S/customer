import PropTypes from 'prop-types';
import { useState } from 'react';
import { Alert, Box, Button, Typography } from '@mui/material';

import { useDashboardStats } from '../model/useDashboardStats';
import {
   formatStatsRange,
   formatStatsRangeShort,
   isCustomStatsPeriod,
   toIsoDateOnly,
} from '../model/stats.helpers';
import {
   DEFAULT_STATS_PERIOD,
   STATS_PERIODS,
   customerStatsConfig,
} from '../model/stats.config';
import { DashboardStatsGroup } from './DashboardStatsGroup';
import { DashboardStatsPeriodSelector } from './DashboardStatsPeriodSelector';

const DEFAULT_PERIODS = {
   leadsPeriod: DEFAULT_STATS_PERIOD,
   factoringsPeriod: DEFAULT_STATS_PERIOD,
};

function getPeriodLabel(value) {
   if (isCustomStatsPeriod(value)) {
      return formatStatsRangeShort(value.from, value.to);
   }

   return STATS_PERIODS.find((item) => item.value === value)?.label ?? '';
}

export function DashboardStats({ config = customerStatsConfig }) {
   const [periods, setPeriods] = useState(DEFAULT_PERIODS);

   const { data, isLoading, isRefreshing, refreshingSections, error, retry } =
      useDashboardStats(periods, config);

   const showGroups = Boolean(data) || isLoading;

   function handlePeriodChange(sectionKey, value) {
      setPeriods((current) => ({ ...current, [sectionKey]: value }));
   }

   function renderPeriodSelector(card) {
      if (!card.periodSelectorLabel) {
         return null;
      }

      const value = periods[card.sectionKey];
      const section = data?.[card.sectionKey];

      return (
         <DashboardStatsPeriodSelector
            value={value}
            fallbackRange={{
               from: toIsoDateOnly(section?.from),
               to: toIsoDateOnly(section?.to),
            }}
            label={getPeriodLabel(value)}
            tooltip={formatStatsRange(section?.from, section?.to)}
            ariaLabel={card.periodSelectorLabel}
            onChange={(nextValue) => handlePeriodChange(card.sectionKey, nextValue)}
         />
      );
   }

   return (
      <Box component="section" sx={{ mb: 2 }} aria-busy={isLoading || isRefreshing}>
         <Typography variant="h6" sx={{ mb: 1.5 }}>
            Статистика
         </Typography>

         {error && (
            <Alert
               severity="error"
               sx={{ mb: 1.5 }}
               action={
                  <Button color="inherit" size="small" onClick={retry}>
                     Повторить
                  </Button>
               }
            >
               {error}
            </Alert>
         )}

         {showGroups && (
            <Box
               sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: {
                     xs: 'minmax(0, 1fr)',
                     lg: 'minmax(0, 2fr) minmax(0, 3fr)',
                  },
                  opacity: error ? 0.5 : 1,
                  transition: 'opacity 0.2s ease',
               }}
            >
               {config.groups.map((group) => (
                  <DashboardStatsGroup
                     key={group.id}
                     group={group}
                     data={data}
                     loading={isLoading && !data}
                     refreshingSections={refreshingSections}
                     renderCardAction={renderPeriodSelector}
                  />
               ))}
            </Box>
         )}
      </Box>
   );
}

DashboardStats.propTypes = {
   config: PropTypes.shape({
      groups: PropTypes.array.isRequired,
   }),
};

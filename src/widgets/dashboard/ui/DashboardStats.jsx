import PropTypes from 'prop-types';
import { useState } from 'react';
import { Alert, Box, Button, MenuItem, Select, Typography } from '@mui/material';

import { useDashboardStats } from '../model/useDashboardStats';
import { formatStatsRange } from '../model/stats.helpers';
import {
   DEFAULT_STATS_PERIOD,
   STATS_PERIODS,
   customerStatsConfig,
} from '../model/stats.config';
import { DashboardStatsGroup } from './DashboardStatsGroup';

export function DashboardStats({ config = customerStatsConfig }) {
   const [period, setPeriod] = useState(DEFAULT_STATS_PERIOD);

   const { data, isLoading, isRefreshing, error, retry } = useDashboardStats(
      period,
      config,
   );

   const periodLabel =
      STATS_PERIODS.find((item) => item.value === period)?.label ?? '';
   const rangeLabel = formatStatsRange(data?.from, data?.to);
   const showGroups = Boolean(data) || isLoading;

   function handlePeriodChange(event) {
      setPeriod(event.target.value);
   }

   return (
      <Box component="section" sx={{ mb: 2 }} aria-busy={isLoading || isRefreshing}>
         <Box
            sx={{
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'space-between',
               gap: 2,
               mb: 1.5,
            }}
         >
            <Typography variant="h6">Статистика</Typography>

            <Select
               size="small"
               value={period}
               onChange={handlePeriodChange}
               inputProps={{ 'aria-label': 'Период статистики' }}
               sx={{ minWidth: 140 }}
            >
               {STATS_PERIODS.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                     {item.label}
                  </MenuItem>
               ))}
            </Select>
         </Box>

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
                  opacity: isRefreshing || error ? 0.5 : 1,
                  pointerEvents: isRefreshing ? 'none' : 'auto',
                  transition: 'opacity 0.2s ease',
               }}
            >
               {config.groups.map((group) => (
                  <DashboardStatsGroup
                     key={group.id}
                     group={group}
                     data={data}
                     loading={isLoading && !data}
                     periodLabel={periodLabel}
                     rangeLabel={rangeLabel}
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

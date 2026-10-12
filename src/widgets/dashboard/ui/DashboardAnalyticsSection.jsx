import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Stack, Typography } from '@mui/material';

import { useLeadsAnalytics } from '../model/useLeadsAnalytics';
import {
   ANALYTICS_PERIODS,
   CUSTOM_ANALYTICS_PERIOD,
   DEFAULT_ANALYTICS_PERIOD,
   getGroupByOptions,
} from '../model/analytics.config';
import { isCustomAnalyticsPeriod } from '../model/analytics.helpers';
import { formatStatsRange, formatStatsRangeShort, toIsoDateOnly } from '../model/stats.helpers';
import { DashboardAnalyticsPeriodSelector } from './DashboardAnalyticsPeriodSelector';
import { DashboardAnalyticsGroupBySelector } from './DashboardAnalyticsGroupBySelector';
import { DashboardAnalyticsPreviousToggle } from './DashboardAnalyticsPreviousToggle';
import { DashboardAnalyticsCurrencyCards } from './DashboardAnalyticsCurrencyCards';
import { DashboardAnalyticsChart } from './DashboardAnalyticsChart';
import { DashboardAnalyticsLeadsTable } from './DashboardAnalyticsLeadsTable';
import { DashboardStatsViewToggle, STATS_VIEW_MODE_COUNT } from './DashboardStatsViewToggle';

const PER_PAGE = 10;

function getPeriodLabel(value) {
   if (isCustomAnalyticsPeriod(value)) {
      return formatStatsRangeShort(value.from, value.to);
   }

   return ANALYTICS_PERIODS.find((item) => item.value === value)?.label ?? '';
}

export function DashboardAnalyticsSection() {
   const [period, setPeriod] = useState(DEFAULT_ANALYTICS_PERIOD);
   const [groupBy, setGroupBy] = useState(null);
   const [previousEnabled, setPreviousEnabled] = useState(false);
   const [viewMode, setViewMode] = useState(STATS_VIEW_MODE_COUNT);
   const [page, setPage] = useState(1);
   const [selectedCurrency, setSelectedCurrency] = useState(null);

   const isCustom = isCustomAnalyticsPeriod(period);

   const groupByOptions = useMemo(
      () => getGroupByOptions(isCustom ? CUSTOM_ANALYTICS_PERIOD : period, isCustom ? period : null),
      [period, isCustom],
   );

   useEffect(() => {
      const values = groupByOptions.map((option) => option.value);

      if (!values.includes(groupBy)) {
         setGroupBy(values[0] ?? null);
      }
   }, [groupByOptions, groupBy]);

   useEffect(() => {
      setPage(1);
   }, [period, groupBy]);

   const { data, isLoading, error, retry } = useLeadsAnalytics({
      period: isCustom ? undefined : period,
      from: isCustom ? period.from : undefined,
      to: isCustom ? period.to : undefined,
      groupBy,
      page,
      perPage: PER_PAGE,
   });

   useEffect(() => {
      if (!data?.currencies?.length) {
         return;
      }

      if (!data.currencies.some((currency) => currency.currency === selectedCurrency)) {
         setSelectedCurrency(data.currencies[0].currency);
      }
   }, [data, selectedCurrency]);

   const fallbackRange = {
      from: toIsoDateOnly(data?.from),
      to: toIsoDateOnly(data?.to),
   };

   return (
      <Box component="section" sx={{ mb: 2 }} aria-busy={isLoading}>
         <Box
            sx={{
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'space-between',
               flexWrap: 'wrap',
               gap: 1,
               mb: 1.5,
            }}
         >
            <Typography variant="h6">Перевозки</Typography>

            <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
               <DashboardAnalyticsPreviousToggle
                  checked={previousEnabled}
                  onChange={setPreviousEnabled}
               />

               <DashboardAnalyticsGroupBySelector
                  value={groupBy}
                  options={groupByOptions}
                  onChange={setGroupBy}
               />

               <DashboardStatsViewToggle value={viewMode} onChange={setViewMode} />

               <DashboardAnalyticsPeriodSelector
                  value={period}
                  periods={ANALYTICS_PERIODS}
                  fallbackRange={fallbackRange}
                  label={getPeriodLabel(period)}
                  tooltip={formatStatsRange(data?.from, data?.to)}
                  ariaLabel="Период перевозок"
                  onChange={setPeriod}
               />
            </Stack>
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

         <DashboardAnalyticsCurrencyCards
            currencies={data?.currencies ?? []}
            previous={previousEnabled ? data?.previous ?? null : null}
            viewMode={viewMode}
            loading={isLoading && !data}
         />

         {data && !isLoading && (
            <DashboardAnalyticsChart
               currencies={data.currencies}
               selectedCurrency={selectedCurrency}
               onSelectCurrency={setSelectedCurrency}
               viewMode={viewMode}
            />
         )}

         <Box sx={{ mt: 2 }}>
            <DashboardAnalyticsLeadsTable
               rows={data?.leads?.results ?? []}
               count={data?.leads?.count ?? 0}
               page={data?.leads?.page ?? page}
               perPage={data?.leads?.perPage ?? PER_PAGE}
               loading={isLoading}
               onPageChange={setPage}
            />
         </Box>
      </Box>
   );
}

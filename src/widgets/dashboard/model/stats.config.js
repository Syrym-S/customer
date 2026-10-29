import { fetchCustomerStats } from '../api/stats.repository';
import { mapStatsResponseFromApi } from './stats.adapter';

export const STATS_PERIODS = [
   { value: 'day', labelKey: 'dashboard.stats.today' },
   { value: 'week', labelKey: 'dashboard.period.week' },
   { value: 'month', labelKey: 'dashboard.period.month' },
   { value: 'year', labelKey: 'dashboard.period.year' },
];

export const DEFAULT_STATS_PERIOD = 'month';

export const CUSTOM_STATS_PERIOD = 'custom';

export const customerStatsConfig = {
   role: 'customer',
   fetchStats: fetchCustomerStats,
   mapResponse: mapStatsResponseFromApi,
   groups: [
      {
         id: 'period',
         titleKey: 'dashboard.stats.forPeriod',
         columns: 2,
         cards: [
            {
               id: 'factorings-period',
               sectionKey: 'factoringsPeriod',
               labelKey: 'dashboard.stats.factoringSales',
               periodSelectorLabelKey: 'dashboard.stats.factoringSalesPeriod',
               countKey: 'dashboard.saleCount',
               showSums: true,
            },
         ],
      },
      {
         id: 'active',
         titleKey: 'dashboard.stats.active',
         columns: 3,
         cards: [
            {
               id: 'leads-active',
               sectionKey: 'leadsActive',
               labelKey: 'dashboard.stats.activeShipments',
               countKey: 'common.shipmentCount',
               showSums: true,
            },
            {
               id: 'tenders-active',
               sectionKey: 'tendersActive',
               labelKey: 'dashboard.stats.activeTenders',
               countKey: 'dashboard.tenderCount',
               showSums: false,
            },
            {
               id: 'factorings-active',
               sectionKey: 'factoringsActive',
               labelKey: 'dashboard.stats.activeFactoringSales',
               countKey: 'dashboard.saleCount',
               showSums: true,
            },
         ],
      },
   ],
};

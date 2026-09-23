import { fetchCustomerStats } from '../api/stats.repository';
import { mapStatsResponseFromApi } from './stats.adapter';

export const STATS_PERIODS = [
   { value: 'day', label: 'Сегодня' },
   { value: 'week', label: 'Неделя' },
   { value: 'month', label: 'Месяц' },
   { value: 'year', label: 'Год' },
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
         title: 'За период',
         columns: 2,
         cards: [
            {
               id: 'leads-period',
               sectionKey: 'leadsPeriod',
               label: 'Перевозки',
               periodSelectorLabel: 'Период перевозок',
               unitForms: ['перевозка', 'перевозки', 'перевозок'],
               showSums: true,
            },
            {
               id: 'factorings-period',
               sectionKey: 'factoringsPeriod',
               label: 'Продажи факторинга',
               periodSelectorLabel: 'Период продаж факторинга',
               unitForms: ['продажа', 'продажи', 'продаж'],
               showSums: true,
            },
         ],
      },
      {
         id: 'active',
         title: 'Активные',
         // caption: 'Не зависит от периода',
         columns: 3,
         cards: [
            {
               id: 'leads-active',
               sectionKey: 'leadsActive',
               label: 'Активные перевозки',
               unitForms: ['перевозка', 'перевозки', 'перевозок'],
               showSums: true,
            },
            {
               id: 'tenders-active',
               sectionKey: 'tendersActive',
               label: 'Активные аукционы',
               unitForms: ['аукцион', 'аукциона', 'аукционов'],
               showSums: false,
            },
            {
               id: 'factorings-active',
               sectionKey: 'factoringsActive',
               label: 'Активные продажи факторинга',
               unitForms: ['продажа', 'продажи', 'продаж'],
               showSums: true,
            },
         ],
      },
   ],
};

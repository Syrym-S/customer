import {
   isFactoringEnabled,
   isTenderEnabled,
} from '../../../shared/config/feature-flags';
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

const FACTORING_CARD_IDS = ['factorings-period', 'factorings-active'];

const TENDER_CARD_IDS = ['tenders-active'];

// Пока раздел скрыт флагом (факторинг, тендеры), его плитки убираем и из
// статистики: иначе на дашборде остаются цифры по разделу, которого для
// пользователя нет. Группа "за период" состоит из одной факторинговой
// плитки, поэтому при выключенном флаге отпадает целиком — отсюда
// отбрасывание пустых групп и пересчёт columns под оставшиеся карточки.
function applyFeatureFlags(groups) {
   if (isFactoringEnabled && isTenderEnabled) {
      return groups;
   }

   const hiddenCardIds = [
      ...(isFactoringEnabled ? [] : FACTORING_CARD_IDS),
      ...(isTenderEnabled ? [] : TENDER_CARD_IDS),
   ];

   return groups
      .map((group) => {
         const cards = group.cards.filter(
            (card) => !hiddenCardIds.includes(card.id),
         );

         return {
            ...group,
            cards,
            columns: Math.max(1, Math.min(group.columns, cards.length)),
         };
      })
      .filter((group) => group.cards.length > 0);
}

export const customerStatsConfig = {
   role: 'customer',
   fetchStats: fetchCustomerStats,
   mapResponse: mapStatsResponseFromApi,
   groups: applyFeatureFlags([
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
   ]),
};

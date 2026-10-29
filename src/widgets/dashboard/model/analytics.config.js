import i18n from '../../../shared/i18n';

export const ANALYTICS_PERIODS = [
   { value: 'week', labelKey: 'dashboard.period.week' },
   { value: 'month', labelKey: 'dashboard.period.month' },
   { value: 'quarter', labelKey: 'dashboard.period.quarter' },
   { value: 'half_year', labelKey: 'dashboard.period.halfYear' },
   { value: 'year', labelKey: 'dashboard.period.year' },
];

export const DEFAULT_ANALYTICS_PERIOD = 'month';

export const CUSTOM_ANALYTICS_PERIOD = 'custom';

const GROUP_BY_LABEL_KEYS = {
   day: 'dashboard.groupBy.day',
   week: 'dashboard.groupBy.week',
   month: 'dashboard.groupBy.month',
   quarter: 'dashboard.groupBy.quarter',
};

const GROUP_BY_VALUES_BY_PERIOD = {
   week: ['day'],
   month: ['week', 'day'],
   quarter: ['month', 'week'],
   half_year: ['month', 'quarter'],
   year: ['month', 'quarter'],
};

function getGroupByValuesForRange(from, to) {
   const days = Math.round((new Date(to) - new Date(from)) / 86400000) + 1;

   if (days <= 7) {
      return ['day'];
   }

   if (days <= 31) {
      return ['week', 'day'];
   }

   if (days <= 92) {
      return ['month', 'week'];
   }

   return ['month', 'quarter'];
}

export function getGroupByOptions(period, range) {
   const values =
      period === CUSTOM_ANALYTICS_PERIOD
         ? getGroupByValuesForRange(range?.from, range?.to)
         : GROUP_BY_VALUES_BY_PERIOD[period] ?? [];

   return values.map((value) => ({
      value,
      label: GROUP_BY_LABEL_KEYS[value] ? i18n.t(GROUP_BY_LABEL_KEYS[value]) : value,
   }));
}

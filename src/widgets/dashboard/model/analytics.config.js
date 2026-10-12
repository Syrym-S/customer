export const ANALYTICS_PERIODS = [
   { value: 'week', label: 'Неделя' },
   { value: 'month', label: 'Месяц' },
   { value: 'quarter', label: 'Квартал' },
   { value: 'half_year', label: 'Полгода' },
   { value: 'year', label: 'Год' },
];

export const DEFAULT_ANALYTICS_PERIOD = 'month';

export const CUSTOM_ANALYTICS_PERIOD = 'custom';

const GROUP_BY_LABELS = {
   day: 'По дням',
   week: 'По неделям',
   month: 'По месяцам',
   quarter: 'По кварталам',
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
      label: GROUP_BY_LABELS[value] ?? value,
   }));
}

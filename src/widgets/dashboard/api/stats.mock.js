const MOCK_DELAY_MS = 500;

function pad(value) {
   return String(value).padStart(2, '0');
}

function toIsoDate(date) {
   return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function getRange(period) {
   const today = new Date();
   const from = new Date(today);

   if (period === 'week') {
      from.setDate(today.getDate() - 6);
   } else if (period === 'month') {
      from.setDate(1);
   } else if (period === 'year') {
      from.setMonth(0, 1);
   }

   return { from: toIsoDate(from), to: toIsoDate(today) };
}

const ACTIVE_SECTIONS = {
   leads_active: {
      count: 14,
      currencies: [
         { currency: 'KZT', sum: 86450000, count: 8 },
         { currency: 'USD', sum: 41200, count: 3 },
         { currency: 'RUB', sum: 1850000, count: 2 },
         { currency: 'EUR', sum: 9800, count: 1 },
      ],
   },
   tenders_active: { count: 7 },
   factorings_active: {
      count: 3,
      currencies: [
         { currency: 'KZT', sum: 12500000, count: 2 },
         { currency: 'USD', sum: 8300, count: 1 },
      ],
   },
};

const PERIOD_SECTIONS = {
   day: {
      leads_period: { count: 0, currencies: [] },
      factorings_period: { count: 0, currencies: [] },
   },
   week: {
      leads_period: {
         count: 4,
         currencies: [{ currency: 'KZT', sum: 18700000, count: 4 }],
      },
   },
   month: {
      leads_period: {
         count: 21,
         currencies: [
            { currency: 'KZT', sum: 64300000, count: 16 },
            { currency: 'USD', sum: 27450, count: 5 },
         ],
      },
      factorings_period: {
         count: 2,
         currencies: [{ currency: 'KZT', sum: 9200000, count: 2 }],
      },
   },
   year: {
      leads_period: {
         count: 187,
         currencies: [
            { currency: 'KZT', sum: 742800000, count: 141 },
            { currency: 'USD', sum: 318900, count: 29 },
            { currency: 'RUB', sum: 15400000, count: 12 },
            { currency: 'EUR', sum: 44100, count: 5 },
         ],
      },
      factorings_period: {
         count: 19,
         currencies: [
            { currency: 'KZT', sum: 96500000, count: 14 },
            { currency: 'USD', sum: 52700, count: 4 },
            { currency: 'EUR', sum: 7300, count: 1 },
         ],
      },
   },
};

const DEFAULT_PERIOD = 'month';
const DAY_MS = 24 * 60 * 60 * 1000;
const EMPTY_SECTION = { count: 0, currencies: [] };

function getPeriodForRange(from, to) {
   const days = Math.round((new Date(to) - new Date(from)) / DAY_MS) + 1;

   if (days <= 1) {
      return 'day';
   }

   if (days <= 7) {
      return 'week';
   }

   if (days <= 31) {
      return 'month';
   }

   return 'year';
}

function resolvePeriodSection(params, key) {
   const from = params[`${key}_from`];
   const to = params[`${key}_to`];

   if (from && to) {
      return {
         period: null,
         from,
         to,
         ...(PERIOD_SECTIONS[getPeriodForRange(from, to)][key] ?? EMPTY_SECTION),
      };
   }

   const period = PERIOD_SECTIONS[params[key]] ? params[key] : DEFAULT_PERIOD;

   return {
      period,
      ...getRange(period),
      ...(PERIOD_SECTIONS[period][key] ?? EMPTY_SECTION),
   };
}

export async function fetchCustomerStatsMock(params = {}) {
   await new Promise((resolve) => {
      window.setTimeout(resolve, MOCK_DELAY_MS);
   });

   return {
      leads_period: resolvePeriodSection(params, 'leads_period'),
      factorings_period: resolvePeriodSection(params, 'factorings_period'),
      ...ACTIVE_SECTIONS,
   };
}

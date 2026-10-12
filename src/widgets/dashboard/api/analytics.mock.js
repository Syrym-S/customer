import { mockLeads } from '../../customer-leads/model/leads.mock';

const MOCK_DELAY_MS = 400;
const DAY_MS = 24 * 60 * 60 * 1000;
const CURRENCY_CODES = ['KZT', 'USD'];

function pad(value) {
   return String(value).padStart(2, '0');
}

function toIsoDate(date) {
   return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function addDays(date, amount) {
   const result = new Date(date);

   result.setDate(result.getDate() + amount);

   return result;
}

function addMonths(date, amount) {
   const result = new Date(date);

   result.setMonth(result.getMonth() + amount);

   return result;
}

function startOfWeek(date) {
   const result = new Date(date);
   const day = result.getDay();
   const diff = day === 0 ? -6 : 1 - day;

   result.setDate(result.getDate() + diff);

   return result;
}

function startOfMonth(date) {
   const result = new Date(date);

   result.setDate(1);

   return result;
}

function startOfQuarter(date) {
   const result = new Date(date);

   result.setMonth(Math.floor(result.getMonth() / 3) * 3, 1);

   return result;
}

function startOfHalfYear(date) {
   const result = new Date(date);

   result.setMonth(Math.floor(result.getMonth() / 6) * 6, 1);

   return result;
}

function startOfYear(date) {
   const result = new Date(date);

   result.setMonth(0, 1);

   return result;
}

function resolveRangeForPeriod(period) {
   const today = new Date();
   let from;

   if (period === 'week') {
      from = startOfWeek(today);
   } else if (period === 'quarter') {
      from = startOfQuarter(today);
   } else if (period === 'half_year') {
      from = startOfHalfYear(today);
   } else if (period === 'year') {
      from = startOfYear(today);
   } else {
      from = startOfMonth(today);
   }

   return { from: toIsoDate(from), to: toIsoDate(today) };
}

function getIsoWeekKey(date) {
   const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
   const dayNumber = target.getUTCDay() || 7;

   target.setUTCDate(target.getUTCDate() + 4 - dayNumber);

   const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
   const weekNumber = Math.ceil(((target - yearStart) / DAY_MS + 1) / 7);

   return `${target.getUTCFullYear()}-W${pad(weekNumber)}`;
}

function buildBuckets(from, to, groupBy) {
   const fromDate = new Date(from);
   const toDate = new Date(to);
   const buckets = [];

   if (groupBy === 'week') {
      let cursor = startOfWeek(fromDate);

      while (cursor <= toDate) {
         const weekEnd = addDays(cursor, 6);
         const bucketFrom = cursor < fromDate ? fromDate : cursor;
         const bucketTo = weekEnd > toDate ? toDate : weekEnd;

         buckets.push({
            key: getIsoWeekKey(cursor),
            from: toIsoDate(bucketFrom),
            to: toIsoDate(bucketTo),
         });

         cursor = addDays(cursor, 7);
      }
   } else if (groupBy === 'month') {
      let cursor = startOfMonth(fromDate);

      while (cursor <= toDate) {
         const monthEnd = addDays(addMonths(cursor, 1), -1);
         const bucketFrom = cursor < fromDate ? fromDate : cursor;
         const bucketTo = monthEnd > toDate ? toDate : monthEnd;

         buckets.push({
            key: `${cursor.getFullYear()}-${pad(cursor.getMonth() + 1)}`,
            from: toIsoDate(bucketFrom),
            to: toIsoDate(bucketTo),
         });

         cursor = addMonths(cursor, 1);
      }
   } else if (groupBy === 'quarter') {
      let cursor = startOfQuarter(fromDate);

      while (cursor <= toDate) {
         const quarterEnd = addDays(addMonths(cursor, 3), -1);
         const bucketFrom = cursor < fromDate ? fromDate : cursor;
         const bucketTo = quarterEnd > toDate ? toDate : quarterEnd;
         const quarterNumber = Math.floor(cursor.getMonth() / 3) + 1;

         buckets.push({
            key: `${cursor.getFullYear()}-Q${quarterNumber}`,
            from: toIsoDate(bucketFrom),
            to: toIsoDate(bucketTo),
         });

         cursor = addMonths(cursor, 3);
      }
   } else {
      let cursor = new Date(fromDate);

      while (cursor <= toDate) {
         const bucketDate = toIsoDate(cursor);

         buckets.push({ key: bucketDate, from: bucketDate, to: bucketDate });

         cursor = addDays(cursor, 1);
      }
   }

   return buckets;
}

function seededFraction(seed) {
   const value = Math.sin(seed) * 10000;

   return Math.abs(value - Math.floor(value));
}

function buildCurrencyBuckets(buckets, currencyIndex) {
   return buckets.map((bucket, index) => {
      const fraction = seededFraction((currencyIndex + 1) * 97 + index * 13);
      const count = Math.round(fraction * 5);
      const unitPrice = currencyIndex === 0 ? 150000 : 350;
      const price = count * unitPrice + Math.round(fraction * unitPrice);

      return {
         ...bucket,
         count,
         price,
         emergency_count: index % 7 === 0 && count > 0 ? 1 : 0,
      };
   });
}

function sumBuckets(buckets) {
   return buckets.reduce(
      (total, bucket) => ({
         count: total.count + bucket.count,
         price: total.price + bucket.price,
         emergency_count: total.emergency_count + bucket.emergency_count,
      }),
      { count: 0, price: 0, emergency_count: 0 },
   );
}

function shiftPeriodStartBack(period, periodStart) {
   const result = new Date(periodStart);

   if (period === 'week') {
      result.setDate(result.getDate() - 7);
   } else if (period === 'month') {
      result.setMonth(result.getMonth() - 1);
   } else if (period === 'quarter') {
      result.setMonth(result.getMonth() - 3);
   } else if (period === 'half_year') {
      result.setMonth(result.getMonth() - 6);
   } else if (period === 'year') {
      result.setFullYear(result.getFullYear() - 1);
   }

   return result;
}

function getPreviousRange(period, from, to) {
   const fromDate = new Date(from);
   const toDate = new Date(to);
   const offsetDays = Math.round((toDate - fromDate) / DAY_MS);

   if (!period) {
      const previousTo = addDays(fromDate, -1);
      const previousFrom = addDays(previousTo, -offsetDays);

      return { from: toIsoDate(previousFrom), to: toIsoDate(previousTo) };
   }

   const previousFrom = shiftPeriodStartBack(period, fromDate);
   const previousTo = addDays(previousFrom, offsetDays);

   return { from: toIsoDate(previousFrom), to: toIsoDate(previousTo) };
}

function getDefaultGroupBy(period, from, to) {
   if (period === 'week') {
      return 'day';
   }

   if (period === 'quarter' || period === 'half_year' || period === 'year') {
      return 'month';
   }

   if (period === 'month') {
      return 'week';
   }

   const days = Math.round((new Date(to) - new Date(from)) / DAY_MS) + 1;

   if (days <= 7) {
      return 'day';
   }

   if (days <= 31) {
      return 'week';
   }

   if (days <= 92) {
      return 'month';
   }

   return 'quarter';
}

function toLeadCreatedAtDate(lead) {
   const value = lead.created_at?.date;

   return value ? new Date(value.replace(' ', 'T')) : null;
}

export async function fetchLeadsAnalyticsMock({
   period,
   from,
   to,
   groupBy,
   page = 1,
   perPage = 10,
} = {}) {
   await new Promise((resolve) => {
      window.setTimeout(resolve, MOCK_DELAY_MS);
   });

   const isCustomRange = Boolean(from && to);
   const resolvedPeriod = isCustomRange
      ? null
      : ['week', 'month', 'quarter', 'half_year', 'year'].includes(period)
         ? period
         : 'month';
   const range = isCustomRange ? { from, to } : resolveRangeForPeriod(resolvedPeriod);
   const resolvedGroupBy = groupBy || getDefaultGroupBy(resolvedPeriod, range.from, range.to);

   const buckets = buildBuckets(range.from, range.to, resolvedGroupBy);

   const currencies = CURRENCY_CODES.map((code, index) => {
      const currencyBuckets = buildCurrencyBuckets(buckets, index);

      return {
         currency: code,
         total: sumBuckets(currencyBuckets),
         buckets: currencyBuckets,
      };
   });

   const previousRange = getPreviousRange(resolvedPeriod, range.from, range.to);

   const previousPayload = {
      from: previousRange.from,
      to: previousRange.to,
      currencies: currencies.map((currency, index) => {
         const factor = 0.78 + index * 0.06;

         return {
            currency: currency.currency,
            count: Math.round(currency.total.count * factor),
            price: Math.round(currency.total.price * factor),
            emergency_count: currency.total.emergency_count,
         };
      }),
   };

   const rangeFromDate = new Date(range.from);
   const rangeToDate = new Date(`${range.to}T23:59:59`);

   const leadsInRange = mockLeads.filter((lead) => {
      const createdAt = toLeadCreatedAtDate(lead);

      return Boolean(createdAt) && createdAt >= rangeFromDate && createdAt <= rangeToDate;
   });

   const startIndex = (page - 1) * perPage;
   const pageResults = leadsInRange.slice(startIndex, startIndex + perPage).map((lead) => ({
      id: lead.id,
      num: lead.num,
      route: { from: lead.from_location, to: lead.to_location },
      currency: lead.currency,
      price: lead.summ,
   }));

   return {
      period: resolvedPeriod ?? 'custom',
      from: range.from,
      to: range.to,
      group_by: resolvedGroupBy,
      currencies,
      previous: previousPayload,
      leads: {
         results: pageResults,
         page,
         per_page: perPage,
         count: leadsInRange.length,
      },
   };
}

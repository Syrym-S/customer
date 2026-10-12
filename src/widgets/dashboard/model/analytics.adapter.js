function toNumber(value) {
   const number = Number(value);

   return Number.isFinite(number) ? number : 0;
}

function toDateString(value) {
   return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function toCurrencyCode(value) {
   return String(value ?? '').trim().toUpperCase();
}

function mapBucket(bucket) {
   return {
      key: bucket?.key ?? '',
      from: toDateString(bucket?.from),
      to: toDateString(bucket?.to),
      count: toNumber(bucket?.count),
      sum: toNumber(bucket?.price),
      emergencyCount: toNumber(bucket?.emergency_count),
   };
}

function mapCurrencyTotal(currency) {
   return {
      currency: toCurrencyCode(currency?.currency),
      count: toNumber(currency?.total?.count),
      sum: toNumber(currency?.total?.price),
      emergencyCount: toNumber(currency?.total?.emergency_count),
      buckets: Array.isArray(currency?.buckets)
         ? currency.buckets.map(mapBucket)
         : [],
   };
}

function mapPreviousCurrency(currency) {
   return {
      currency: toCurrencyCode(currency?.currency),
      count: toNumber(currency?.count),
      sum: toNumber(currency?.price),
      emergencyCount: toNumber(currency?.emergency_count),
   };
}

function mapPrevious(previous) {
   if (!previous || typeof previous !== 'object') {
      return null;
   }

   return {
      from: toDateString(previous.from),
      to: toDateString(previous.to),
      currencies: Array.isArray(previous.currencies)
         ? previous.currencies.map(mapPreviousCurrency)
         : [],
   };
}

function mapLead(lead) {
   const routeFrom = lead?.route?.from ?? '';
   const routeTo = lead?.route?.to ?? '';

   return {
      id: lead?.id ?? '',
      num: lead?.num ?? '',
      route: [routeFrom, routeTo].filter(Boolean).join(' → '),
      sum: toNumber(lead?.price),
      currency: toCurrencyCode(lead?.currency),
   };
}

function mapLeads(leads) {
   const source = leads && typeof leads === 'object' ? leads : {};

   return {
      results: Array.isArray(source.results) ? source.results.map(mapLead) : [],
      page: toNumber(source.page) || 1,
      perPage: toNumber(source.per_page) || 10,
      count: toNumber(source.count),
   };
}

export function mapAnalyticsResponseFromApi(response) {
   const payload =
      response?.data && typeof response.data === 'object'
         ? response.data
         : response;
   const source = payload && typeof payload === 'object' ? payload : {};

   return {
      period: source.period ?? null,
      from: toDateString(source.from),
      to: toDateString(source.to),
      groupBy: source.group_by ?? null,
      currencies: Array.isArray(source.currencies)
         ? source.currencies.map(mapCurrencyTotal)
         : [],
      previous: mapPrevious(source.previous),
      leads: mapLeads(source.leads),
   };
}

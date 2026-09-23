const SECTION_KEYS = [
   'leads_period',
   'factorings_period',
   'leads_active',
   'tenders_active',
   'factorings_active',
];

function toNumber(value) {
   const number = Number(value);

   return Number.isFinite(number) ? number : 0;
}

function toDateString(value) {
   return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function mapCurrencies(list) {
   if (!Array.isArray(list)) {
      return [];
   }

   return list
      .map((item) => ({
         currency: String(item?.currency ?? '')
            .trim()
            .toUpperCase(),
         sum: toNumber(item?.sum),
         count: toNumber(item?.count),
      }))
      .filter((item) => item.currency);
}

function mapSection(section) {
   if (!section || typeof section !== 'object') {
      return { count: 0, currencies: [] };
   }

   return {
      count: toNumber(section.count),
      currencies: mapCurrencies(section.currencies),
   };
}

function mapPeriod(value) {
   return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function mapPeriodSection(section, fallback) {
   return {
      ...mapSection(section),
      period: mapPeriod(section?.period) ?? fallback.period,
      from: toDateString(section?.from) ?? fallback.from,
      to: toDateString(section?.to) ?? fallback.to,
   };
}

export function mapStatsResponseFromApi(response) {
   const payload =
      response?.data && typeof response.data === 'object'
         ? response.data
         : response;
   const source = payload && typeof payload === 'object' ? payload : {};

   const isLegacyShape =
      !SECTION_KEYS.some((key) => key in source) && 'count' in source;
   const fallback = {
      period: mapPeriod(source.period),
      from: toDateString(source.from),
      to: toDateString(source.to),
   };

   return {
      leadsPeriod: mapPeriodSection(
         isLegacyShape ? source : source.leads_period,
         fallback,
      ),
      factoringsPeriod: mapPeriodSection(source.factorings_period, fallback),
      leadsActive: mapSection(source.leads_active),
      tendersActive: { count: mapSection(source.tenders_active).count },
      factoringsActive: mapSection(source.factorings_active),
   };
}

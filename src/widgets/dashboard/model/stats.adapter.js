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

export function mapStatsResponseFromApi(response) {
   const payload =
      response?.data && typeof response.data === 'object'
         ? response.data
         : response;
   const source = payload && typeof payload === 'object' ? payload : {};

   const isLegacyShape =
      !SECTION_KEYS.some((key) => key in source) && 'count' in source;

   return {
      period: typeof source.period === 'string' ? source.period : null,
      from: toDateString(source.from),
      to: toDateString(source.to),
      leadsPeriod: mapSection(isLegacyShape ? source : source.leads_period),
      factoringsPeriod: mapSection(source.factorings_period),
      leadsActive: mapSection(source.leads_active),
      tendersActive: { count: mapSection(source.tenders_active).count },
      factoringsActive: mapSection(source.factorings_active),
   };
}

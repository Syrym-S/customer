function appendPeriodParams(params, key, value) {
   if (!value) {
      return;
   }

   if (typeof value === 'string') {
      params[key] = value;
      return;
   }

   if (value.from && value.to) {
      params[`${key}_from`] = value.from;
      params[`${key}_to`] = value.to;
   }
}

export function buildStatsQueryParams({ leadsPeriod, factoringsPeriod } = {}) {
   const params = {};

   appendPeriodParams(params, 'leads_period', leadsPeriod);
   appendPeriodParams(params, 'factorings_period', factoringsPeriod);

   return params;
}

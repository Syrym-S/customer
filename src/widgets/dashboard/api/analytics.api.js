import { apiClient } from '../../../shared/api/api-client';

export async function fetchLeadsAnalyticsApi({
   period,
   from,
   to,
   groupBy,
   page = 1,
   perPage = 10,
} = {}) {
   const params = {
      page,
      per_page: perPage,
   };

   if (from && to) {
      params.from = from;
      params.to = to;
   } else if (period) {
      params.period = period;
   }

   if (groupBy) {
      params.group_by = groupBy;
   }

   const response = await apiClient.get('/customer/v1/leads/analytics', {
      params,
   });

   return response.data;
}

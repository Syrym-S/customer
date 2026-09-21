import { apiClient } from '../../../shared/api/api-client';

export async function fetchCustomerStatsApi({ period } = {}) {
   const params = {};

   if (period) {
      params.period = period;
   }

   const response = await apiClient.get('/customer/v1/leads/stats', { params });

   return response.data;
}

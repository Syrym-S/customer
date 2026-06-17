import { apiClient } from '../../../shared/api/api-client';

export async function createLeadApi(payload) {
   const response = await apiClient.post('/customer/v1/leads/create', payload);

   return response.data;
}

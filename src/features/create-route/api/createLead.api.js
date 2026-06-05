import { apiClient } from '../../../shared/api/apiClient';

export async function createLeadApi(payload) {
   const response = await apiClient.post('/forwarder/v1/leads/create', payload);

   return response.data;
}

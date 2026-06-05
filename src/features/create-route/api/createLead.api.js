import { apiClient } from '../../../shared/api/apiClient';

export async function createLeadApi(payload) {
   const response = await apiClient.post('/forwarder/v1/leads', payload);

   return response.data;
}

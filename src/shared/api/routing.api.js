import { apiClient } from './api-client';

export async function generateRoute(payload) {
   const response = await apiClient.post('/routing/v4/generate', payload);

   return response.data;
}

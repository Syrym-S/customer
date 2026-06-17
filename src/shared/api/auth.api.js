import { apiClient } from './api-client';

export async function logoutApi() {
   const response = await apiClient.post('/auth/v1/logout');

   return response.data;
}

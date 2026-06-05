import { apiClient } from './apiClient';

export async function logoutApi() {
   const response = await apiClient.post('/auth/v1/logout');

   return response.data;
}

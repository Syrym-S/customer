import { apiClient } from './api-client';

export async function fetchLanguagesApi() {
   const response = await apiClient.get('/customer/v1/languages');

   return response.data?.results ?? [];
}

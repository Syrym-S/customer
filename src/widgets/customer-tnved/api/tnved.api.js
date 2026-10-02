import { apiClient } from '../../../shared/api/api-client';

export async function fetchTnvedTreeApi() {
   const response = await apiClient.get('/customer/v1/tnved/tree');

   return response.data;
}

export async function searchTnvedApi(query) {
   const response = await apiClient.get('/customer/v1/tnved/search', {
      params: { search: query },
   });

   return response.data;
}

export async function searchTnvedCodesApi(query) {
   const response = await apiClient.get('/customer/v1/tnved/codes/search', {
      params: { search: query },
   });

   return response.data;
}

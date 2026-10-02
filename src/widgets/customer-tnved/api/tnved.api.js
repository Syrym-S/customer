import { apiClient } from '../../../shared/api/api-client';

export async function fetchTnvedCatalogApi({ q, page, per_page } = {}) {
   const response = await apiClient.get('/customer/v1/tnved', {
      params: { q, page, per_page },
   });

   return response.data;
}

export async function searchTnvedCodesApi(q, limit) {
   const response = await apiClient.get('/customer/v1/tnved/search', {
      params: { q, limit },
   });

   return response.data;
}

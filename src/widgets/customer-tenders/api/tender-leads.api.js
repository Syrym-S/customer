import { apiClient } from '../../../shared/api/apiClient';

export async function searchTenderLeadsApi({
   q = '',
   status,
   page,
   perPage = 10,
} = {}) {
   const params = {
      page,
      per_page: perPage,
   };

   const normalizedQuery = String(q ?? '').trim();

   if (normalizedQuery) {
      params.q = normalizedQuery;
   }

   if (status && status !== 'all') {
      params.status = status;
   }

   const response = await apiClient.get('/customer/v1/leads/search', {
      params,
   });

   return response.data;
}

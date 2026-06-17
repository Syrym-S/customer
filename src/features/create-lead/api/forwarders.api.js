import { apiClient } from '../../../shared/api/api-client';
import { mapForwardersResponseFromApi } from '../model/forwarders.adapter';

// function isBin(value) {
//    return /^\d+$/.test(String(value ?? '').trim());
// }

export async function searchForwardersApi(query) {
   const normalizedQuery = String(query ?? '').trim();

   if (!normalizedQuery) {
      return [];
   }

   const response = await apiClient.get('/customer/v1/search/forwarders', {
      params: {
         q: normalizedQuery,
      },
   });

   return mapForwardersResponseFromApi(response.data);
}

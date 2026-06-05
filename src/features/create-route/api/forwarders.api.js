import { apiClient } from '../../../shared/api/apiClient';
import { mapForwardersResponseFromApi } from '../model/forwarders.adapter';

export async function searchForwardersApi(query) {
   const normalizedQuery = String(query ?? '').trim();

   const response = await apiClient.get('/customer/v1/search/forwarders', {
      params: {
         company_name: normalizedQuery,
         bin: normalizedQuery,
      },
   });

   return mapForwardersResponseFromApi(response.data);
}

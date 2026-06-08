import { apiClient } from '../../../shared/api/apiClient';
import { mapForwardersResponseFromApi } from '../model/forwarders.adapter';

function isBin(value) {
   return /^\d+$/.test(String(value ?? '').trim());
}

export async function searchForwardersApi(query) {
   const normalizedQuery = String(query ?? '').trim();

   if (!normalizedQuery) {
      return [];
   }

   const response = await apiClient.get('/customer/v1/search/forwarders', {
      params: {
         ...(isBin(normalizedQuery)
            ? { bin: normalizedQuery }
            : { company_name: normalizedQuery }),
      },
   });

   return mapForwardersResponseFromApi(response.data);
}

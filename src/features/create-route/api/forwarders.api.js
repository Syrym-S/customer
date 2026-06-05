import { apiClient } from '../../../shared/api/apiClient';
import { mapForwardersResponseFromApi } from '../model/forwarders.adapter';

export async function searchForwardersApi(query) {
   const response = await apiClient.get('/customer/v1/search/forwarders', {
      params: {
         search: query,
      },
   });

   return mapForwardersResponseFromApi(response.data);
}

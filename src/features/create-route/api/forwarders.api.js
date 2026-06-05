import { apiClient } from '../../../shared/api/apiClient';
import { mapForwardersResponseFromApi } from '../model/forwarders.adapter';

function mergeUniqueForwarders(forwarders) {
   const map = new Map();

   forwarders.forEach((forwarder) => {
      if (!forwarder.id) {
         return;
      }

      map.set(forwarder.id, forwarder);
   });

   return Array.from(map.values());
}

export async function searchForwardersApi(query) {
   const normalizedQuery = String(query ?? '').trim();

   if (!normalizedQuery) {
      return [];
   }

   const [companyNameResponse, companyBinResponse] = await Promise.all([
      apiClient.get('/customer/v1/search/forwarders', {
         params: {
            companyName: normalizedQuery,
         },
      }),

      apiClient.get('/customer/v1/search/forwarders', {
         params: {
            companyBin: normalizedQuery,
         },
      }),
   ]);

   const companyNameForwarders = mapForwardersResponseFromApi(
      companyNameResponse.data,
   );

   const companyBinForwarders = mapForwardersResponseFromApi(
      companyBinResponse.data,
   );

   return mergeUniqueForwarders([
      ...companyNameForwarders,
      ...companyBinForwarders,
   ]);
}

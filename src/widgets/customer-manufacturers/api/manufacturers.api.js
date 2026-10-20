import { apiClient } from '../../../shared/api/api-client';

export async function searchManufacturersApi(query) {
   const normalizedQuery = String(query ?? '').trim();

   if (!normalizedQuery) {
      return { items: [] };
   }

   const response = await apiClient.get('/customer/v1/manufacturers/search', {
      params: { q: normalizedQuery },
   });

   return response.data;
}

export async function fetchMyManufacturersApi() {
   const response = await apiClient.get('/customer/v1/manufacturers');

   return response.data;
}

export async function attachManufacturerApi(manufacturerId) {
   const response = await apiClient.post('/customer/v1/manufacturers/attach', {
      manufacturerId,
   });

   return response.data;
}

export async function detachManufacturerApi(manufacturerId) {
   const response = await apiClient.delete(
      `/customer/v1/manufacturers/${manufacturerId}`,
   );

   return response.data;
}

export async function attachManufacturerToLeadApi(leadId, manufacturerId) {
   const response = await apiClient.post(
      `/customer/v1/lead/${leadId}/manufacturer`,
      { manufacturerId },
   );

   return response.data;
}

export async function detachManufacturerFromLeadApi(leadId) {
   const response = await apiClient.delete(
      `/customer/v1/lead/${leadId}/manufacturer`,
   );

   return response.data;
}

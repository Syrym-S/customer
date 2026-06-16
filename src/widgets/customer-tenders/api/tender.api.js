import { apiClient } from '../../../shared/api/apiClient';
import { mapTenderLeadsSearchFromApi } from '../model/tender.adapter';

export async function fetchCustomerTenders({
   page = 1,
   limit = 10,
   status,
} = {}) {
   const params = { page, limit };

   if (status && status !== 'all') {
      params.status = status;
   }

   const response = await apiClient.get('/customer/v1/tenders', {
      params,
   });

   return response.data;
}

export async function fetchCustomerTenderById(tenderId) {
   const response = await apiClient.get(`/customer/v1/tender/${tenderId}`);

   return response.data;
}

export async function createCustomerTender(payload) {
   const response = await apiClient.post('/customer/v1/tender/create', payload);

   return response.data;
}

export async function addTenderParticipant(tenderId, participantId) {
   const response = await apiClient.post(
      `/customer/v1/tender/${tenderId}/participant`,
      {
         participant_id: participantId,
      },
   );

   return response.data;
}

export async function acceptTenderBet(tenderId, betIndex) {
   const response = await apiClient.post(
      `/customer/v1/tender/${tenderId}/bet/${betIndex}/win`,
   );

   return response.data;
}

export async function deleteCustomerTender(tenderId) {
   const response = await apiClient.delete(`/customer/v1/tender/${tenderId}`);

   return response.data;
}

export async function deleteTenderParticipant(tenderId, participantIndex) {
   const response = await apiClient.delete(
      `/customer/v1/tender/${tenderId}/participant/${participantIndex}`,
   );

   return response.data;
}

export async function cancelCustomerTender(tenderId) {
   const response = await apiClient.post(
      `/customer/v1/tender/${tenderId}/cancel`,
   );

   return response.data;
}

export async function searchTenderLeadsApi({
   q = '',
   status,
   page = 1,
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

   return mapTenderLeadsSearchFromApi(response.data);
}

export async function updateCustomerTender(tenderId, payload) {
   const response = await apiClient.put(
      `/customer/v1/tender/${tenderId}/update`,
      payload,
   );

   return response.data;
}

export async function startCustomerTender(tenderId) {
   const response = await apiClient.post(
      `/customer/v1/tender/${tenderId}/start`,
   );

   return response.data;
}

export async function fetchTenderLeadFiles(leadId) {
   const response = await apiClient.get(`/customer/v1/leads/${leadId}/files`);

   return response.data;
}

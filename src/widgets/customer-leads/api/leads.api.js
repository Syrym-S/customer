import { apiClient } from '../../../shared/api/api-client';

export async function fetchCustomerLeadsApi({ page = 1, perPage = 4, status } = {}) {
   const params = {
      page,
      per_page: perPage,
   };

   if (status) {
      params.status = status;
   }

   const response = await apiClient.get('/customer/v1/leads', { params });

   return response.data;
}

export async function fetchCustomerLeadByIdApi(leadId) {
   const response = await apiClient.get(`/customer/v1/leads/${leadId}`);

   return response.data;
}

export async function updateCustomerLeadApi(leadId, payload) {
   const response = await apiClient.post(
      `/customer/v1/leads/${leadId}/update`,
      payload,
   );

   return response.data;
}

export async function deleteLeadCargoApi(leadId, cargoIndex) {
   const response = await apiClient.delete(
      `/customer/v1/lead/${leadId}/cargos/${cargoIndex}`,
   );

   return response.data;
}

// Response shape: { token, url, expires_at } — `url` is the full,
// ready-to-share link (already includes the token), and `expires_at` is
// a "YYYY-MM-DD HH:mm:ss" timestamp.
export async function getLeadShareLinkApi(leadId) {
   const response = await apiClient.post(`/customer/v1/lead/${leadId}/share`);

   return response.data;
}
import { apiClient } from '../../../shared/api/api-client';

export async function fetchCustomerLeadsApi({
   page = 1,
   perPage = 4,
   status,
   search,
   isDraft,
} = {}) {
   const params = {
      page,
      per_page: perPage,
   };

   if (status) {
      params.status = status;
   }

   if (isDraft) {
      params.is_draft = 1;
   }

   const normalizedSearch = String(search ?? '').trim();

   if (normalizedSearch) {
      params.q = normalizedSearch;
   }

   const endpoint = normalizedSearch
      ? '/customer/v1/leads/search'
      : '/customer/v1/leads';

   const response = await apiClient.get(endpoint, { params });

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

export async function publishLeadApi(leadId) {
   const response = await apiClient.post(`/customer/v1/lead/${leadId}/publish`);

   return response.data;
}

export async function deleteLeadApi(leadId) {
   const response = await apiClient.delete(`/customer/v1/lead/${leadId}`);

   return response.data;
}

export async function exportLeadsReportApi({ dateFrom, dateTo }) {
   const response = await apiClient.get('/customer/v1/reports/leads/export', {
      params: {
         date_from: dateFrom,
         date_to: dateTo,
      },
      responseType: 'blob',
   });

   return {
      blob: response.data,
      contentDisposition: response.headers?.['content-disposition'] ?? null,
   };
}
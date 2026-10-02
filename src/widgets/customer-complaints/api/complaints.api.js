import { apiClient } from '../../../shared/api/api-client';

export async function fetchComplaintsApi({ page = 1, perPage = 10 } = {}) {
   const response = await apiClient.get('/customer/v1/complaints', {
      params: {
         page,
         per_page: perPage,
      },
   });

   return response.data;
}

export async function fetchComplaintByIdApi(complaintId) {
   const response = await apiClient.get(
      `/customer/v1/complaints/${encodeURIComponent(complaintId)}`,
   );

   return response.data;
}

export async function createComplaintApi(payload) {
   const response = await apiClient.post('/customer/v1/complaints', payload);

   return response.data;
}

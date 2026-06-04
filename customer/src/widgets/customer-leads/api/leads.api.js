import { apiClient } from '../../../shared/api/apiClient';

export async function fetchCustomerLeadsApi({ page = 1, perPage = 4 } = {}) {
   const response = await apiClient.get('/customer/v1/leads', {
      params: {
         page,
         per_page: perPage,
      },
   });

   return response.data;
}

export async function fetchCustomerLeadByIdApi(leadId) {
   const response = await apiClient.get(`/customer/v1/leads/${leadId}`);

   return response.data;
}

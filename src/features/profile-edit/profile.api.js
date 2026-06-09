import { apiClient } from '../../shared/api/apiClient';

export async function fetchCustomerProfile() {
   const response = await apiClient.get('/customer/profile/v1/get');

   return response.data;
}

export async function updateCustomerProfile(payload) {
   const response = await apiClient.post(
      '/customer/profile/v1/update',
      payload,
   );

   return response.data;
}

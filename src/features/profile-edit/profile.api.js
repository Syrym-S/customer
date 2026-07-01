import { apiClient } from '../../shared/api/api-client';

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

export async function uploadCustomerAvatar(file) {
   const formData = new FormData();

   formData.append('file', file);
   formData.append('name', file.name);

   const response = await apiClient.post(
      '/customer/profile/v1/avatar/upload',
      formData,
      {
         headers: {
            'Content-Type': 'multipart/form-data',
         },
      },
   );

   return response.data;
}

export async function deleteCustomerAvatar() {
   const response = await apiClient.delete('/customer/profile/v1/avatar');

   return response.data;
}

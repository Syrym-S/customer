import { apiClient } from './api-client';

export async function fetchSupportContactsApi({ signal } = {}) {
   const response = await apiClient.get('/app/v1/support', {
      skipContractGate: true,
      signal,
   });

   const data = response.data?.data ?? response.data ?? {};

   return {
      email: String(data.email || '').trim(),
      phone: String(data.phone || '').trim(),
   };
}

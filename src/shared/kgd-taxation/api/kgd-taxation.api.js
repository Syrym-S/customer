import { apiClient } from '../../api/api-client';

export async function fetchTaxationRegimeApi(role, entityId) {
   const response = await apiClient.get(`/customer/v1/kgd/${role}/${entityId}`);

   return response.data;
}

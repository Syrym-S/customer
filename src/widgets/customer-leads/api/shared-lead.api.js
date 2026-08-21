import { apiClient } from '../../../shared/api/api-client';

// Unauthenticated endpoint — token is required for the backend to authorize
// the request even though lead_id alone is in the path.
export async function getSharedLeadApi(leadId, token) {
   const response = await apiClient.get(`/customer/v1/shared-lead/${leadId}`, {
      params: { token },
   });

   return response.data;
}

import { apiClient } from '../../../shared/api/api-client';

export async function fetchEmailVerificationStatus() {
   const response = await apiClient.get('/auth/v1/email-status');

   return response.data;
}

export async function resendEmailVerification() {
   const response = await apiClient.post('/auth/v1/resend-verification', {});

   return response.data;
}

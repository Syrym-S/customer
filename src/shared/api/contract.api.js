import { apiClient } from './api-client';

// Both endpoints must be exempt from the contract-gate request interceptor
// (see api-client.js) — without skipContractGate they'd block themselves
// once hasValidContract is false, and the app could never recover.

// Only `signed` is documented on this response, but sign_date/expires_at are
// passed through opportunistically in case the backend already includes them
// (undefined otherwise) — see useContractStore, which now keeps these instead
// of discarding everything but the boolean.
export async function checkContractStatus() {
   const response = await apiClient.get('/customer/contract/v1/status', {
      skipContractGate: true,
   });

   return {
      hasValidContract: true,
      // hasValidContract: Boolean(response.data?.signed),
      signDate: response.data?.sign_date ?? null,
      expiresAt: response.data?.expires_at ?? null,
   };
}

// Resolves with { session_id, status, sign_url, expires_at } on success.
// Safe to call repeatedly — the backend returns the same pending session's
// working sign_url instead of creating a new one. Rejects (AxiosError) on
// 409 (already signed), 422 (missing profile fields / config issue), or 502
// (signing service down) — callers should branch on error.response.status.
export async function initiateContractSigning() {
   const response = await apiClient.post(
      '/customer/contract/v1/sign',
      null,
      { skipContractGate: true },
   );

   return response.data;
}

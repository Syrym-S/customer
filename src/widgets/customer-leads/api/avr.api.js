// AVR (акт выполненных работ) API for customer.
//
// Confirmed real contract (2 endpoints — unlike driver-mobile's 3, customer
// has no generate step: the forwarder produces and signs the PDF first,
// customer only ever receives that same finished PDF and adds a second
// signature to it):
//   GET  /wp-json/customer/avr/v1/{lead_id}
//        -> { signed, document: { name, mime, size, content (base64) } }
//        `signed` reflects the CUSTOMER's own signature, not forwarder's.
//   POST /wp-json/customer/avr/v1/{lead_id}/sign (empty body)
//        -> { session_id, status, sign_url, expires_at }
import { apiClient } from '../../../shared/api/api-client';

export async function fetchAvrStatusApi(leadId) {
   const response = await apiClient.get(`/customer/avr/v1/${leadId}`);

   return response.data;
}

export async function signAvrDocumentApi(leadId) {
   const response = await apiClient.post(`/customer/avr/v1/${leadId}/sign`);

   return response.data;
}

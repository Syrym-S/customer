import { apiClient } from '../../../shared/api/apiClient';

export async function fetchLeadDocuments(leadId) {
   const response = await apiClient.get(`/customer/v1/leads/${leadId}/files`);

   return response.data;
}

export async function uploadLeadDocument(leadId, { file, context }) {
   const formData = new FormData();

   formData.append('file', file);
   formData.append('context', context || '');

   const response = await apiClient.post(
      `/customer/v1/leads/${leadId}/files/upload`,
      formData,
      {
         headers: {
            'Content-Type': 'multipart/form-data',
         },
      },
   );

   return response.data;
}

export async function deleteLeadDocument(leadId, path) {
   const response = await apiClient.post(
      `/customer/v1/leads/${leadId}/files/delete`,
      {
         path,
      },
   );

   return response.data;
}

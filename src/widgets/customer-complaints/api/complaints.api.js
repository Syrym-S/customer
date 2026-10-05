import { apiClient } from '../../../shared/api/api-client';

export async function fetchComplaints() {
   const response = await apiClient.get('/customer/v1/complaints');

   return response.data;
}

export async function fetchComplaintById(complaintId) {
   const response = await apiClient.get(
      `/customer/v1/complaints/${encodeURIComponent(complaintId)}`,
   );

   return response.data;
}

export async function fetchComplaintTargets() {
   const response = await apiClient.get('/customer/v1/complaints/targets');

   return response.data;
}

export async function createComplaint({ request, target, files }) {
   const formData = new FormData();

   formData.append('request', request);

   if (target) {
      formData.append('target_type', target.type);
      formData.append('target_id', target.id);
   }

   for (const file of files) {
      formData.append('files[]', file);
   }

   const response = await apiClient.post('/customer/v1/complaints', formData);

   return response.data;
}

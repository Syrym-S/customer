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

export async function updateProfileDocuments({
    registrationDocumentFile,
    employerDocumentFile,
}) {
    const payload = new FormData();

    if (registrationDocumentFile) {
        payload.append(
            'registration_document',
            registrationDocumentFile,
            registrationDocumentFile.name,
        );

        payload.append(
            'registration_document_name',
            'Документ о регистрации юридического лица',
        );
    }

    if (employerDocumentFile) {
        payload.append(
            'employer_document',
            employerDocumentFile,
            employerDocumentFile.name,
        );

        payload.append(
            'employer_document_name',
            'Документ о трудоустройстве сотрудника с правом подписи или приказ о назначении первого руководителя',
        );
    }

    const response = await apiClient.post(
        '/customer/profile/v1/documents/update',
        payload,
    );

    return response.data;
}
import { apiClient } from "../../shared/api/api-client";
import i18n from "../../shared/i18n";

export async function fetchCustomerProfile() {
  const response = await apiClient.get("/customer/profile/v1/get");

  return response.data;
}

export async function updateCustomerProfile(payload) {
  const response = await apiClient.post("/customer/profile/v1/update", payload);

  return response.data;
}

export async function uploadCustomerAvatar(file) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("name", file.name);

  const response = await apiClient.post(
    "/customer/profile/v1/avatar/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
}

export async function deleteCustomerAvatar() {
  const response = await apiClient.delete("/customer/profile/v1/avatar");

  return response.data;
}

export async function deleteCustomerAccount(password) {
  const response = await apiClient.post("/customer/profile/v1/delete", {
    password,
  });

  return response.data;
}

export async function getLegalDocumentsApi() {
  const response = await apiClient.get("/customer/profile/v1/documents");

  return response.data.documents;
}

export async function updateProfileDocuments({
  registrationDocumentFile,
  employerDocumentFile,
}) {
  if (!registrationDocumentFile && !employerDocumentFile) {
    return null;
  }

  const payload = new FormData();

  if (registrationDocumentFile) {
    payload.append(
      "registration_document",
      registrationDocumentFile,
      registrationDocumentFile.name,
    );

    payload.append(
      "registration_document_name",
      i18n.t("profile.documents.legalEntity"),
    );
  }

  if (employerDocumentFile) {
    payload.append(
      "employer_document",
      employerDocumentFile,
      employerDocumentFile.name,
    );

    payload.append(
      "employer_document_name",
      i18n.t("profile.documents.employmentFull"),
    );
  }

  const response = await apiClient.post(
    "/customer/profile/v1/documents/upload",
    payload,
  );

  return response.data;
}

import { apiClient } from "../../../shared/api/api-client";

export async function fetchLeadChatMessagesApi(entityId, chatType = "lead") {
  const response = await apiClient.get(
    `/customer/v1/leads/${entityId}/chat/messages`,
    { params: { chat_type: chatType } },
  );

  return response.data;
}

export async function fetchLeadChatsListApi(page = 1) {
  const response = await apiClient.get("/customer/v1/chats", {
    params: { page },
  });

  return response.data;
}

export async function fetchLeadChatWsTokenApi(leadId, chatType = "lead", { signal } = {}) {
  const response = await apiClient.get(
    `/customer/v1/leads/${leadId}/chat/token`,
    { params: { chat_type: chatType }, signal },
  );

  return response.data;
}

// UNCONFIRMED: file[] multipart attachment upload not verified end-to-end against a real response.
export async function sendLeadChatMessageApi(entityId, text, attachments = [], chatType = "lead") {
  const message = (text ?? "").trim();

  if (attachments.length === 0) {
    const response = await apiClient.post(
      `/customer/v1/leads/${entityId}/chat/messages`,
      { chat_type: chatType, message },
    );

    return response.data;
  }

  const formData = new FormData();
  formData.append("chat_type", chatType);

  // UNCONFIRMED: omitting empty message field (vs sending '') not verified to fix the 400 error it worked around.
  if (message) {
    formData.append("message", message);
  }

  for (const file of attachments) {
    formData.append("file[]", file);
  }

  const response = await apiClient.post(
    `/customer/v1/leads/${entityId}/chat/messages`,
    formData,
  );

  return response.data;
}

export async function fetchLeadChatAttachmentBlobApi(entityId, attachmentId, chatType = "lead") {
  const response = await apiClient.get(
    `/customer/v1/leads/${entityId}/chat/attachments/${attachmentId}`,
    { params: { chat_type: chatType }, responseType: "blob" },
  );

  return response.data;
}

export async function deleteLeadChatMessageApi(leadId, messageId, chatType = "lead") {
  const response = await apiClient.delete(
    `/customer/v1/leads/${leadId}/chat/messages/${messageId}`,
    { params: { chat_type: chatType } },
  );

  return response.data;
}

export async function editLeadChatMessageApi(leadId, messageId, newText, chatType = "lead") {
  const response = await apiClient.put(
    `/customer/v1/leads/${leadId}/chat/messages/${messageId}`,
    { message: newText },
    { params: { chat_type: chatType } },
  );

  return response.data;
}

// UNCONFIRMED: response shape not confirmed (not parsed, body ignored either way).
export async function markLeadChatAsReadApi(leadId, chatType = "lead") {
  const response = await apiClient.post(
    `/customer/v1/leads/${leadId}/chat/messages/read`,
    { chat_type: chatType },
  );

  return response.data;
}

export async function fetchLeadChatParticipantsApi(leadId, chatType = "lead") {
  const response = await apiClient.get(
    `/customer/v1/leads/${leadId}/chat/participants`,
    { params: { chat_type: chatType } },
  );

  return response.data;
}

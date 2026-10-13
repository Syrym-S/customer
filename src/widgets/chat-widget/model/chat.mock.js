export const CHAT_CATEGORIES = [
  { key: "shipments", label: "Перевозки" },
  { key: "factorings", label: "Факторинги" },
  { key: "delivery", label: "Доставка" },
  { key: "support", label: "Поддержка" },
];

export const SUPPORT_CHAT_ID = "support-chat";

export function createSupportChat() {
  return {
    id: SUPPORT_CHAT_ID,
    entityType: "support",
    entityId: SUPPORT_CHAT_ID,
    apiEntityId: null,
    categoryKey: "support",
    counterpart: { name: "Техническая поддержка", role: "Поддержка" },
    counterparts: [{ name: "Техническая поддержка", role: "Поддержка" }],
    routeSummary: "",
    unreadCount: 0,
    lastActivityAt: new Date().toISOString(),
    messages: [],
    messagesLoaded: true,
  };
}

let mockMessageIdCounter = 0;

export function createMockMessageId() {
  mockMessageIdCounter += 1;
  return `mock-message-${Date.now()}-${mockMessageIdCounter}`;
}

let mockAttachmentIdCounter = 0;

export function createMockAttachmentId() {
  mockAttachmentIdCounter += 1;
  return `mock-attachment-${Date.now()}-${mockAttachmentIdCounter}`;
}

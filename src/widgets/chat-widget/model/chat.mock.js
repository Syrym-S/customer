export const CHAT_CATEGORIES = [
  { key: "shipments", label: "Перевозки" },
  { key: "factorings", label: "Факторинги" },
];

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

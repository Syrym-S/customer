export function truncateText(text, maxLength = 60) {
  if (!text) {
    return "";
  }

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trimEnd()}…`;
}

export function formatRelativeTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) {
    return "только что";
  }

  if (diffMin < 60) {
    return `${diffMin} мин`;
  }

  const diffHours = Math.floor(diffMin / 60);

  if (diffHours < 24) {
    return `${diffHours} ч`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays === 1) {
    return "вчера";
  }

  if (diffDays < 7) {
    return `${diffDays} дн`;
  }

  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
  });
}

export function getLastMessage(chat) {
  if (!chat?.messages?.length) {
    return null;
  }

  return chat.messages[chat.messages.length - 1];
}

export function getEntityChats(chats, entityType, entityId) {
  if (!entityType || !entityId) {
    return [];
  }

  return chats.filter(
    (chat) =>
      chat.entityType === entityType && String(chat.entityId) === String(entityId),
  );
}

export function findMostRecentEntityChat(chats, entityType, entityId) {
  const entityChats = getEntityChats(chats, entityType, entityId);

  if (entityChats.length === 0) {
    return null;
  }

  return entityChats.reduce((mostRecent, chat) =>
    new Date(chat.lastActivityAt) > new Date(mostRecent.lastActivityAt)
      ? chat
      : mostRecent,
  );
}

export function getChatsByCategory(chats, categoryKey) {
  return chats
    .filter((chat) => chat.categoryKey === categoryKey)
    .sort(
      (a, b) => new Date(b.lastActivityAt) - new Date(a.lastActivityAt),
    );
}

export function getCategoryUnreadCount(chats, categoryKey) {
  return chats
    .filter((chat) => chat.categoryKey === categoryKey)
    .reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
}

export function getTotalUnreadCount(chats) {
  return chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
}

export const CHAT_MESSAGES_PAGE_SIZE = 25;

function resolveLoadedCount(chat, pagination) {
  return Math.min(
    pagination?.loadedCount ?? CHAT_MESSAGES_PAGE_SIZE,
    chat.messages.length,
  );
}

export function getLoadedMessages(chat, pagination) {
  const loadedCount = resolveLoadedCount(chat, pagination);
  return chat.messages.slice(chat.messages.length - loadedCount);
}

export function hasMoreMessages(chat, pagination) {
  const loadedCount = resolveLoadedCount(chat, pagination);
  return loadedCount < chat.messages.length;
}

export const CHAT_ATTACHMENT_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export const CHAT_ATTACHMENT_ALLOWED_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
];

export const CHAT_ATTACHMENT_MAX_SIZE_MB = 10;
export const CHAT_ATTACHMENT_MAX_SIZE_BYTES =
  CHAT_ATTACHMENT_MAX_SIZE_MB * 1024 * 1024;

export const CHAT_ATTACHMENT_MAX_COUNT = 5;

export function isImageAttachment(attachment) {
  return Boolean(attachment?.fileType?.startsWith("image/"));
}

export function formatFileSize(size) {
  if (!size && size !== 0) {
    return "";
  }

  if (size < 1024) {
    return `${size} Б`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(0)} КБ`;
  }

  return `${(size / 1024 / 1024).toFixed(2)} МБ`;
}

export function validateChatAttachmentFile(file) {
  const fileExtension = String(file.name || "")
    .split(".")
    .pop()
    ?.toLowerCase();

  const hasAllowedType = CHAT_ATTACHMENT_ALLOWED_MIME_TYPES.includes(
    file.type,
  );
  const hasAllowedExtension =
    CHAT_ATTACHMENT_ALLOWED_EXTENSIONS.includes(fileExtension);

  if (!hasAllowedType && !hasAllowedExtension) {
    return "Разрешены только изображения (JPG, PNG, WEBP), PDF, DOC(X) или XLS(X)";
  }

  if (file.size > CHAT_ATTACHMENT_MAX_SIZE_BYTES) {
    return `Размер файла не должен превышать ${CHAT_ATTACHMENT_MAX_SIZE_MB} MB`;
  }

  return "";
}

const AVATAR_LEGAL_FORM_PREFIXES = ["тоо", "ао", "оао", "зао", "ип", "пк", "гп", "кх"];

const AVATAR_PALETTE = [
  "#1976D2",
  "#0097A7",
  "#7B1FA2",
  "#C2185B",
  "#F57C00",
  "#5D4037",
  "#388E3C",
  "#455A64",
];

function stripAvatarLegalFormPrefix(text) {
  const words = text.trim().split(/\s+/);

  if (
    words.length > 1 &&
    AVATAR_LEGAL_FORM_PREFIXES.includes(words[0].toLowerCase())
  ) {
    return words.slice(1).join(" ");
  }

  return text;
}

function stripAvatarQuotes(text) {
  return text.replace(/[«»"']/g, "").trim();
}

export function getCounterpartAvatarSource(counterpart) {
  return counterpart?.companyName || counterpart?.name || "";
}

export function getCounterpartInitials(counterpart) {
  const raw = getCounterpartAvatarSource(counterpart);

  if (!raw) {
    return "?";
  }

  const cleaned = stripAvatarQuotes(stripAvatarLegalFormPrefix(raw));
  const words = cleaned.split(/\s+/).filter((word) => /\p{L}/u.test(word));

  if (words.length === 0) {
    return "?";
  }

  if (words.length === 1) {
    const word = words[0];

    const humps = [...word]
      .filter((char, index) => index === 0 || char === char.toUpperCase())
      .slice(0, 2)
      .join("");

    return (humps.length >= 2 ? humps : word.slice(0, 2)).toUpperCase();
  }

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function getCounterpartAvatarColor(counterpart) {
  const source = getCounterpartAvatarSource(counterpart) || "?";

  let hash = 0;

  for (let i = 0; i < source.length; i += 1) {
    hash = source.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % AVATAR_PALETTE.length;

  return AVATAR_PALETTE[index];
}

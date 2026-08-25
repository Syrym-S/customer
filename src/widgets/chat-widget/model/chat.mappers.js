import { participantTypeLabels } from "../../customer-tenders/ui/tender-details/components/tender-participants.helpers";

const CUSTOMER_PARTICIPANT_ROLE_ID = 2;

export function mapLeadChatMessageFromApi(apiMessage, leadId, chatType = "lead") {
  const roleId = apiMessage?.participant?.role_id ?? null;
  const isMine = roleId === CUSTOMER_PARTICIPANT_ROLE_ID;

  return {
    id: apiMessage?.id,
    authorType: isMine ? "me" : "them",
    text: apiMessage?.message ?? "",
    createdAt: apiMessage?.created_at,
    attachments: normalizeLeadChatAttachments(apiMessage?.attachments, leadId, chatType),
    isViewed: apiMessage?.is_viewed ?? null,
    isDeleted: Boolean(apiMessage?.is_deleted),
  };
}

// UNCONFIRMED: only mime_type_id 1 (application/pdf) has been observed; other ids fall back to a generic binary type.
const LEAD_CHAT_MIME_TYPE_BY_ID = {
  1: "application/pdf",
};
const DEFAULT_LEAD_CHAT_MIME_TYPE = "application/octet-stream";

function resolveLeadChatAttachmentMimeType(mimeTypeId) {
  return LEAD_CHAT_MIME_TYPE_BY_ID[mimeTypeId] || DEFAULT_LEAD_CHAT_MIME_TYPE;
}

function mapLeadChatAttachmentFromApi(apiAttachment, leadId, chatType = "lead") {
  return {
    id: apiAttachment?.id,
    fileName: apiAttachment?.file_name ?? "",
    fileType: resolveLeadChatAttachmentMimeType(apiAttachment?.mime_type_id),
    leadId,
    chatType,
    filePath: apiAttachment?.file_path,
  };
}

function normalizeLeadChatAttachments(apiAttachments, leadId, chatType = "lead") {
  if (!Array.isArray(apiAttachments)) {
    return [];
  }

  return apiAttachments.map((apiAttachment) =>
    mapLeadChatAttachmentFromApi(apiAttachment, leadId, chatType),
  );
}

// GAP: factoring message history is not paginated — only page 1 is fetched.
export function normalizeLeadChatMessagesResponse(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.results)) {
    return response.results;
  }

  if (Array.isArray(response?.messages)) {
    return response.messages;
  }

  return [];
}

export function normalizeLeadChatMessageResponse(response) {
  if (response && typeof response === "object" && "id" in response) {
    return response;
  }

  if (response?.data && typeof response.data === "object") {
    return response.data;
  }

  return response;
}

function getParticipantRoleLabel(role) {
  if (!role) {
    return "Участник";
  }

  return participantTypeLabels[role] || role;
}

// GAP: can't distinguish factor vs. forwarder — participants endpoint has no id field; always uses the first entry.
function pickLeadChatParticipant(apiParticipants, chatType = "lead") {
  if (!Array.isArray(apiParticipants) || apiParticipants.length === 0) {
    return null;
  }

  if (apiParticipants.length > 1 && chatType !== "factoring") {
    console.warn(
      `[chat] /chat/participants?chat_type=${chatType} returned more than one participant — expected exactly one per the confirmed example. Using the first.`,
      apiParticipants,
    );
  }

  return apiParticipants[0];
}

function mapLeadChatParticipantFromApi(apiParticipant) {
  const fullName = apiParticipant?.person_fio || undefined;
  const companyName = apiParticipant?.company_name || undefined;

  return {
    name: fullName || companyName || "Участник чата",
    role: getParticipantRoleLabel(apiParticipant?.role),
    fullName,
    companyName,
    bin: apiParticipant?.bin || undefined,
    iin: apiParticipant?.iin || undefined,
    avatarUrl: apiParticipant?.avatar || undefined,
  };
}

export function normalizeLeadChatParticipantsResponse(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.results)) {
    return response.results;
  }

  return [];
}

export function buildLeadCounterpartFromParticipants(apiParticipants, chatType = "lead") {
  const participant = pickLeadChatParticipant(apiParticipants, chatType);
  return participant ? mapLeadChatParticipantFromApi(participant) : null;
}

export function buildLeadCounterpartFromLead(lead) {
  const forwarder = lead?.forwarder;
  const hasForwarderInfo = Boolean(
    forwarder && (forwarder.companyName || (forwarder.fullName && forwarder.fullName !== "Не указан")),
  );

  if (hasForwarderInfo) {
    return {
      name: forwarder.companyName || forwarder.fullName,
      role: "Экспедитор",
      phone: forwarder.phone || undefined,
      fullName: forwarder.fullName && forwarder.fullName !== "Не указан" ? forwarder.fullName : undefined,
      companyName: forwarder.companyName || undefined,
    };
  }

  return {
    name: `Лид #${lead?.num ?? lead?.id}`,
    role: "Экспедитор",
  };
}

function coerceLocationToText(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object") {
    return value.city || value.address || value.label || value.name || value.title || "";
  }

  return String(value);
}

function stripCityPrefix(text) {
  return text.replace(/^г\.?\s*/i, "").trim();
}

const LOCATION_COUNTRY_TOKENS = ["казахстан", "kazakhstan", "рк", "kz"];

// UNCONFIRMED: city-parsing format inferred from a mock fixture, not verified against real API payloads.
function extractCityFromLocationText(text) {
  const segments = text
    .split(",")
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (segments.length === 0) {
    return "";
  }

  const nonCountrySegments = segments.filter(
    (segment) => !LOCATION_COUNTRY_TOKENS.includes(segment.toLowerCase()),
  );

  const candidate = nonCountrySegments[nonCountrySegments.length - 1] || segments[0];

  return stripCityPrefix(candidate);
}

function extractCityLabel(waypoint, fallbackLocationValue) {
  const waypointCityText = coerceLocationToText(waypoint?.city);

  if (waypointCityText) {
    return stripCityPrefix(waypointCityText);
  }

  const fallbackText = coerceLocationToText(fallbackLocationValue);

  if (!fallbackText) {
    return "";
  }

  return extractCityFromLocationText(fallbackText);
}

function collapseRouteCities(fromCity, toCity, { allowCollapseWhenEqual }) {
  if (!fromCity && !toCity) {
    return "";
  }

  if (!toCity) {
    return fromCity;
  }

  if (!fromCity) {
    return toCity;
  }

  if (allowCollapseWhenEqual && fromCity.toLowerCase() === toCity.toLowerCase()) {
    return fromCity;
  }

  return `${fromCity} → ${toCity}`;
}

export function buildLeadRouteSummary(lead) {
  const waypoints = Array.isArray(lead?.waypoints) ? lead.waypoints : [];
  const firstWaypoint = waypoints[0];
  const lastWaypoint = waypoints[waypoints.length - 1];

  const fromCity = extractCityLabel(firstWaypoint, lead?.from_location);
  const toCity = extractCityLabel(lastWaypoint, lead?.to_location);

  const derivedFromFallbackOnly = !firstWaypoint && !lastWaypoint;

  return collapseRouteCities(fromCity, toCity, {
    allowCollapseWhenEqual: derivedFromFallbackOnly,
  });
}

function buildFactoringCounterpartFallback(factoringId) {
  return {
    name: `Факторинг #${factoringId}`,
    role: "Факторинг",
  };
}

export function buildLeadChatFromApiMessages({
  leadId,
  entityId,
  lead,
  counterpart,
  routeSummary,
  fallbackActivityAt,
  chatType = "lead",
}, apiMessages) {
  const resolvedEntityId = entityId ?? leadId;

  const messages = apiMessages
    .map((apiMessage) => mapLeadChatMessageFromApi(apiMessage, leadId, chatType))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const lastMessage = messages[messages.length - 1];

  const unreadCount = messages.filter(
    (message) => message.authorType === "them" && message.isViewed === false,
  ).length;

  const isFactoring = chatType === "factoring";

  return {
    id: `${chatType}-chat-${resolvedEntityId}`,
    entityType: chatType,
    entityId: resolvedEntityId,
    apiEntityId: leadId,
    categoryKey: isFactoring ? "factorings" : "shipments",
    counterpart:
      counterpart ||
      (isFactoring
        ? buildFactoringCounterpartFallback(resolvedEntityId)
        : buildLeadCounterpartFromLead(lead)),
    routeSummary: isFactoring ? "" : routeSummary ?? (lead ? buildLeadRouteSummary(lead) : ""),
    unreadCount,
    lastActivityAt: lastMessage?.createdAt || fallbackActivityAt || new Date().toISOString(),
    messages,
    remoteChatId: apiMessages[0]?.chat_id ?? null,
    messagesLoaded: true,
  };
}

export function normalizeLeadChatsListResponse(response) {
  return {
    entries: Array.isArray(response?.data) ? response.data : [],
    meta: response?.meta || {},
  };
}

// GAP: /customer/v1/chats has no participant/forwarder data — list rows show generic "Лид #<num>" until the chat is opened.
export function mapLeadChatListEntryFromApi(apiChatEntry) {
  const leadId = apiChatEntry?.lead_id ?? apiChatEntry?.lead?.id;
  const lead = apiChatEntry?.lead;

  const fromCity = stripCityPrefix(coerceLocationToText(lead?.from_city));
  const toCity = stripCityPrefix(coerceLocationToText(lead?.to_city));

  const lastMessageText = apiChatEntry?.last_message ?? "";
  const lastMessageAt = apiChatEntry?.last_message_at ?? null;

  return {
    id: `lead-chat-${leadId}`,
    entityType: "lead",
    entityId: leadId,
    categoryKey: "shipments",
    counterpart: {
      name: `Лид #${lead?.num ?? leadId}`,
      role: "Экспедитор",
    },
    routeSummary: collapseRouteCities(fromCity, toCity, { allowCollapseWhenEqual: true }),
    unreadCount: apiChatEntry?.unread_count ?? 0,
    lastActivityAt: lastMessageAt || new Date().toISOString(),
    messages: lastMessageText
      ? [
          {
            id: `${apiChatEntry?.chat_id ?? leadId}-preview`,
            text: lastMessageText,
            createdAt: lastMessageAt,
          },
        ]
      : [],
    remoteChatId: apiChatEntry?.chat_id ?? null,
    messagesLoaded: false,
  };
}

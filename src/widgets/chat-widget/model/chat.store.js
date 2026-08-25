import { create } from "zustand";
import { CHAT_CATEGORIES, createMockMessageId } from "./chat.mock";
import { CHAT_MESSAGES_PAGE_SIZE } from "./chat.helpers";
import {
  buildLeadChatFromApiMessages,
  buildLeadCounterpartFromParticipants,
  mapLeadChatListEntryFromApi,
  mapLeadChatMessageFromApi,
  normalizeLeadChatMessageResponse,
  normalizeLeadChatMessagesResponse,
  normalizeLeadChatParticipantsResponse,
  normalizeLeadChatsListResponse,
} from "./chat.mappers";
import {
  deleteLeadChatMessageApi,
  editLeadChatMessageApi,
  fetchLeadChatMessagesApi,
  fetchLeadChatParticipantsApi,
  fetchLeadChatsListApi,
  markLeadChatAsReadApi,
  sendLeadChatMessageApi,
} from "../api/chat.api";
import { notifyError } from "../../../shared/model/notifications.store";

const LOAD_OLDER_MESSAGES_MIN_DELAY_MS = 400;
const LOAD_OLDER_MESSAGES_MAX_DELAY_MS = 800;

function randomLoadDelayMs() {
  return (
    LOAD_OLDER_MESSAGES_MIN_DELAY_MS +
    Math.random() *
      (LOAD_OLDER_MESSAGES_MAX_DELAY_MS - LOAD_OLDER_MESSAGES_MIN_DELAY_MS)
  );
}

function isPendingOptimisticMessageId(id) {
  return typeof id === "string" && id.startsWith("mock-message-");
}

function isLeadChat(chat) {
  return chat?.entityType === "lead";
}

function isFactoringChat(chat) {
  return chat?.entityType === "factoring";
}

function isRealChat(chat) {
  return isLeadChat(chat) || isFactoringChat(chat);
}

function applyUpdatedMessageFields(message, apiMessage) {
  return {
    ...message,
    text: apiMessage?.message ?? message.text,
    isChanged: apiMessage?.is_changed ?? true,
    updatedAt: apiMessage?.updated_at ?? message.updatedAt,
  };
}

function withMessageDeletedFlag(chats, chatId, messageId, isDeleted) {
  return chats.map((item) =>
    item.id === chatId
      ? {
          ...item,
          messages: item.messages.map((message) =>
            message.id === messageId ? { ...message, isDeleted } : message,
          ),
        }
      : item,
  );
}

function mergeLeadChats(existingChats, newLeadChats) {
  const newById = new Map(newLeadChats.map((chat) => [chat.id, chat]));

  const merged = existingChats.map((chat) => {
    if (!isRealChat(chat) || !newById.has(chat.id)) {
      return chat;
    }

    const incoming = newById.get(chat.id);

    return chat.messagesLoaded && !incoming.messagesLoaded ? chat : incoming;
  });

  const existingIds = new Set(existingChats.map((chat) => chat.id));
  const appended = newLeadChats.filter((chat) => !existingIds.has(chat.id));

  return [...merged, ...appended];
}

export const useChatStore = create((set, get) => ({
  isOpen: false,
  activeCategory: CHAT_CATEGORIES[0].key,
  activeChatId: null,
  chats: [],
  chatPagination: {},

  // GAP: no "list all my factoring chats" endpoint — factoring rows only exist once opened this session.
  leadChatsStatus: "idle", // "idle" | "loading" | "loaded" | "error"
  leadChatsError: "",
  leadChatsPage: 0,
  hasMoreLeadChats: true,
  isLoadingMoreLeadChats: false,

  pendingLeadChatLeadId: null,

  toggleWidget: () => {
    set((state) => ({ isOpen: !state.isOpen }));
  },

  closeWidget: () => {
    set({ isOpen: false });
  },

  openChatById: (chatId) => {
    const chat = get().chats.find((item) => item.id === chatId);

    if (!chat) {
      return;
    }

    set({ isOpen: true, activeCategory: chat.categoryKey });
    get().openChat(chatId);
  },

  fetchEntityChatCounterpart: async (entityId, chatType) => {
    try {
      const participantsResponse = await fetchLeadChatParticipantsApi(entityId, chatType);
      const apiParticipants = normalizeLeadChatParticipantsResponse(participantsResponse);
      return buildLeadCounterpartFromParticipants(apiParticipants, chatType);
    } catch (error) {
      console.error(`Не удалось загрузить участников чата (${chatType}) ${entityId}`, error);
      return null;
    }
  },

  openEntityChat: async (chatType, entityId, counterpart, routeSummary, { apiEntityId } = {}) => {
    const resolvedApiEntityId = apiEntityId ?? entityId;
    const state = get();
    const existingChat = state.chats.find(
      (chat) => chat.entityType === chatType && String(chat.entityId) === String(entityId),
    );

    if (existingChat?.messagesLoaded) {
      get().openChatById(existingChat.id);
      return;
    }

    const activeCategory = chatType === "factoring" ? "factorings" : "shipments";

    set({ isOpen: true, activeCategory, pendingLeadChatLeadId: entityId });

    try {
      const [messagesResponse, participantCounterpart] = await Promise.all([
        fetchLeadChatMessagesApi(resolvedApiEntityId, chatType),
        get().fetchEntityChatCounterpart(resolvedApiEntityId, chatType),
      ]);
      const apiMessages = normalizeLeadChatMessagesResponse(messagesResponse);

      const chat = buildLeadChatFromApiMessages(
        {
          leadId: resolvedApiEntityId,
          entityId,
          chatType,
          counterpart: participantCounterpart || counterpart || existingChat?.counterpart,
          routeSummary: routeSummary ?? existingChat?.routeSummary,
        },
        apiMessages,
      );

      set((prevState) => ({
        chats: mergeLeadChats(prevState.chats, [chat]),
        pendingLeadChatLeadId: null,
      }));

      get().openChatById(chat.id);
    } catch (error) {
      set({ pendingLeadChatLeadId: null });
      notifyError(
        error.response?.data?.message ||
          error.message ||
          (chatType === "factoring"
            ? "Не удалось загрузить чат по факторингу"
            : "Не удалось загрузить чат по лиду"),
      );
    }
  },

  openLeadChat: (leadId, counterpart, routeSummary) =>
    get().openEntityChat("lead", leadId, counterpart, routeSummary),

  openFactoringChat: (factoringId, counterpart, leadId) =>
    get().openEntityChat("factoring", factoringId, counterpart, undefined, {
      apiEntityId: leadId,
    }),

  loadLeadChats: async () => {
    const state = get();

    if (state.leadChatsStatus === "loading") {
      return;
    }

    set({ leadChatsStatus: "loading", leadChatsError: "" });

    try {
      const response = await fetchLeadChatsListApi(1);
      const { entries, meta } = normalizeLeadChatsListResponse(response);
      const chats = entries.map(mapLeadChatListEntryFromApi);
      const currentPage = meta.current_page ?? 1;
      const lastPage = meta.last_page ?? currentPage;

      set((prevState) => ({
        chats: mergeLeadChats(prevState.chats, chats),
        leadChatsStatus: "loaded",
        leadChatsPage: currentPage,
        hasMoreLeadChats: currentPage < lastPage,
      }));
    } catch (error) {
      set({
        leadChatsStatus: "error",
        leadChatsError:
          error.response?.data?.message || error.message || "Не удалось загрузить чаты",
      });
    }
  },

  loadMoreLeadChats: async () => {
    const state = get();

    if (
      state.isLoadingMoreLeadChats ||
      !state.hasMoreLeadChats ||
      state.leadChatsStatus !== "loaded"
    ) {
      return;
    }

    set({ isLoadingMoreLeadChats: true });

    try {
      const nextPage = state.leadChatsPage + 1;
      const response = await fetchLeadChatsListApi(nextPage);
      const { entries, meta } = normalizeLeadChatsListResponse(response);
      const chats = entries.map(mapLeadChatListEntryFromApi);
      const currentPage = meta.current_page ?? nextPage;
      const lastPage = meta.last_page ?? currentPage;

      set((prevState) => ({
        chats: mergeLeadChats(prevState.chats, chats),
        leadChatsPage: currentPage,
        hasMoreLeadChats: currentPage < lastPage,
        isLoadingMoreLeadChats: false,
      }));
    } catch (error) {
      set({ isLoadingMoreLeadChats: false });
      notifyError(
        error.response?.data?.message ||
          error.message ||
          "Не удалось загрузить дополнительные чаты",
      );
    }
  },

  setActiveCategory: (categoryKey) => {
    set({ activeCategory: categoryKey, activeChatId: null });
  },

  openChat: (chatId) => {
    const chat = get().chats.find((item) => item.id === chatId);

    set((state) => {
      const loadedCount =
        chat && isRealChat(chat) ? chat.messages.length : CHAT_MESSAGES_PAGE_SIZE;

      return {
        activeChatId: chatId,
        chats: state.chats.map((item) =>
          item.id === chatId ? { ...item, unreadCount: 0 } : item,
        ),
        chatPagination: {
          ...state.chatPagination,
          [chatId]: { loadedCount, isLoadingMore: false },
        },
      };
    });

    if (chat && isRealChat(chat)) {
      get().markLeadChatAsRead(chat.apiEntityId ?? chat.entityId, chat.entityType);
    }
  },

  // UNCONFIRMED: mark-as-read response shape not confirmed (ignored either way).
  markLeadChatAsRead: async (leadId, chatType = "lead") => {
    try {
      await markLeadChatAsReadApi(leadId, chatType);
    } catch (error) {
      console.warn(`Не удалось отметить чат по лиду ${leadId} как прочитанный`, error);
    }
  },

  loadOlderMessages: (chatId) => {
    const state = get();
    const chat = state.chats.find((item) => item.id === chatId);

    if (!chat || isRealChat(chat)) {
      return;
    }

    const pagination = state.chatPagination[chatId] || {
      loadedCount: CHAT_MESSAGES_PAGE_SIZE,
      isLoadingMore: false,
    };

    if (pagination.isLoadingMore || pagination.loadedCount >= chat.messages.length) {
      return;
    }

    set((prevState) => ({
      chatPagination: {
        ...prevState.chatPagination,
        [chatId]: { ...pagination, isLoadingMore: true },
      },
    }));

    setTimeout(() => {
      set((prevState) => {
        const currentPagination = prevState.chatPagination[chatId];
        const currentChat = prevState.chats.find((item) => item.id === chatId);

        if (!currentPagination || !currentChat) {
          return {};
        }

        const nextLoadedCount = Math.min(
          currentPagination.loadedCount + CHAT_MESSAGES_PAGE_SIZE,
          currentChat.messages.length,
        );

        return {
          chatPagination: {
            ...prevState.chatPagination,
            [chatId]: { loadedCount: nextLoadedCount, isLoadingMore: false },
          },
        };
      });
    }, randomLoadDelayMs());
  },

  backToList: () => {
    set({ activeChatId: null });
  },

  sendMessage: async (chatId, text, attachments = []) => {
    const trimmedText = text.trim();

    if (!trimmedText && attachments.length === 0) {
      return;
    }

    const chat = get().chats.find((item) => item.id === chatId);

    if (chat && isRealChat(chat)) {
      await get().sendLeadMessage(chat, trimmedText, attachments);
      return;
    }

    const message = {
      id: createMockMessageId(),
      authorType: "me",
      text: trimmedText,
      createdAt: new Date().toISOString(),
      attachments,
    };

    set((state) => {
      const existingPagination = state.chatPagination[chatId];

      return {
        chats: state.chats.map((item) =>
          item.id === chatId
            ? {
                ...item,
                messages: [...item.messages, message],
                lastActivityAt: message.createdAt,
              }
            : item,
        ),
        chatPagination: existingPagination
          ? {
              ...state.chatPagination,
              [chatId]: {
                ...existingPagination,
                loadedCount: existingPagination.loadedCount + 1,
              },
            }
          : state.chatPagination,
      };
    });
  },

  // UNCONFIRMED: attachment upload not verified end-to-end against a real response.
  sendLeadMessage: async (chat, trimmedText, attachments) => {
    const entityId = chat.apiEntityId ?? chat.entityId;
    const chatType = chat.entityType;
    const tempId = createMockMessageId();

    const optimisticMessage = {
      id: tempId,
      authorType: "me",
      text: trimmedText,
      createdAt: new Date().toISOString(),
      attachments: attachments.map(({ id, fileName, fileType, size, fileUrl }) => ({
        id,
        fileName,
        fileType,
        size,
        fileUrl,
      })),
    };

    set((state) => {
      const existingPagination = state.chatPagination[chat.id];

      return {
        chats: state.chats.map((item) =>
          item.id === chat.id
            ? {
                ...item,
                messages: [...item.messages, optimisticMessage],
                lastActivityAt: optimisticMessage.createdAt,
              }
            : item,
        ),
        chatPagination: existingPagination
          ? {
              ...state.chatPagination,
              [chat.id]: {
                ...existingPagination,
                loadedCount: existingPagination.loadedCount + 1,
              },
            }
          : state.chatPagination,
      };
    });

    try {
      const files = attachments.map((attachment) => attachment.file).filter(Boolean);
      const response = await sendLeadChatMessageApi(entityId, trimmedText, files, chatType);
      const apiMessage = normalizeLeadChatMessageResponse(response);
      const realMessage = {
        ...mapLeadChatMessageFromApi(apiMessage, entityId, chatType),
        id: apiMessage?.id ?? tempId,
      };

      set((state) => ({
        chats: state.chats.map((item) =>
          item.id === chat.id
            ? {
                ...item,
                messages: item.messages.map((message) =>
                  message.id === tempId ? realMessage : message,
                ),
                lastActivityAt: realMessage.createdAt,
              }
            : item,
        ),
      }));
    } catch (error) {
      set((state) => ({
        chats: state.chats.map((item) =>
          item.id === chat.id
            ? { ...item, messages: item.messages.filter((message) => message.id !== tempId) }
            : item,
        ),
      }));

      notifyError(
        error.response?.data?.message || error.message || "Не удалось отправить сообщение",
      );
    }
  },

  deleteLeadMessage: async (leadId, messageId, chatType = "lead") => {
    const chat = get().chats.find(
      (item) => item.entityType === chatType && String(item.entityId) === String(leadId),
    );

    if (!chat) {
      return;
    }

    const apiEntityId = chat.apiEntityId ?? leadId;

    set((state) => ({
      chats: withMessageDeletedFlag(state.chats, chat.id, messageId, true),
    }));

    try {
      await deleteLeadChatMessageApi(apiEntityId, messageId, chatType);
    } catch (error) {
      set((state) => ({
        chats: withMessageDeletedFlag(state.chats, chat.id, messageId, false),
      }));

      notifyError(
        error.response?.data?.message || error.message || "Не удалось удалить сообщение",
      );
    }
  },

  // UNCONFIRMED: PUT edit endpoint not tested live.
  editLeadMessage: async (leadId, messageId, newText, chatType = "lead") => {
    const trimmedText = newText.trim();

    if (!trimmedText) {
      return;
    }

    const chat = get().chats.find(
      (item) => item.entityType === chatType && String(item.entityId) === String(leadId),
    );

    if (!chat) {
      return;
    }

    const previousMessage = chat.messages.find((message) => message.id === messageId);

    if (!previousMessage) {
      return;
    }

    const apiEntityId = chat.apiEntityId ?? leadId;

    set((state) => ({
      chats: state.chats.map((item) =>
        item.id === chat.id
          ? {
              ...item,
              messages: item.messages.map((message) =>
                message.id === messageId ? { ...message, text: trimmedText } : message,
              ),
            }
          : item,
      ),
    }));

    try {
      const response = await editLeadChatMessageApi(apiEntityId, messageId, trimmedText, chatType);
      const apiMessage = normalizeLeadChatMessageResponse(response);

      if (apiMessage && typeof apiMessage === "object") {
        set((state) => ({
          chats: state.chats.map((item) =>
            item.id === chat.id
              ? {
                  ...item,
                  messages: item.messages.map((message) =>
                    message.id === messageId
                      ? applyUpdatedMessageFields(message, apiMessage)
                      : message,
                  ),
                }
              : item,
          ),
        }));
      }
    } catch (error) {
      set((state) => ({
        chats: state.chats.map((item) =>
          item.id === chat.id
            ? {
                ...item,
                messages: item.messages.map((message) =>
                  message.id === messageId
                    ? { ...message, text: previousMessage.text }
                    : message,
                ),
              }
            : item,
        ),
      }));

      notifyError(
        error.response?.data?.message || error.message || "Не удалось изменить сообщение",
      );
    }
  },

  // GAP: .message.sent dedupes by id only — a WS event arriving before the sender's own POST response reconciles can briefly duplicate.
  receiveLeadMessageSent: (leadId, apiMessage, chatType = "lead") => {
    const chat = get().chats.find(
      (item) => item.entityType === chatType && String(item.entityId) === String(leadId),
    );

    if (!chat || !apiMessage?.id) {
      return;
    }

    if (chat.messages.some((message) => message.id === apiMessage.id)) {
      return;
    }

    const incomingMessage = mapLeadChatMessageFromApi(
      apiMessage,
      chat.apiEntityId ?? leadId,
      chatType,
    );

    set((state) => ({
      chats: state.chats.map((item) => {
        if (item.id !== chat.id) {
          return item;
        }

        if (item.messages.some((message) => message.id === apiMessage.id)) {
          return item;
        }

        // Own message may already be present as an unreconciled optimistic
        // (temp-id) entry if this WS event beats sendLeadMessage's own API
        // response — replace it in place instead of appending a duplicate.
        const pendingOwnIndex =
          incomingMessage.authorType === "me"
            ? item.messages.findIndex((message) => isPendingOptimisticMessageId(message.id))
            : -1;

        const messages =
          pendingOwnIndex === -1
            ? [...item.messages, incomingMessage]
            : item.messages.map((message, index) =>
                index === pendingOwnIndex ? incomingMessage : message,
              );

        return {
          ...item,
          messages,
          lastActivityAt: incomingMessage.createdAt || item.lastActivityAt,
        };
      }),
    }));
  },

  receiveLeadMessageUpdated: (leadId, apiMessage, chatType = "lead") => {
    const chat = get().chats.find(
      (item) => item.entityType === chatType && String(item.entityId) === String(leadId),
    );

    if (!chat || !apiMessage?.id) {
      return;
    }

    set((state) => ({
      chats: state.chats.map((item) =>
        item.id === chat.id
          ? {
              ...item,
              messages: item.messages.map((message) =>
                message.id === apiMessage.id
                  ? applyUpdatedMessageFields(message, apiMessage)
                  : message,
              ),
            }
          : item,
      ),
    }));
  },

  receiveLeadMessageDeleted: (leadId, apiMessage, chatType = "lead") => {
    const chat = get().chats.find(
      (item) => item.entityType === chatType && String(item.entityId) === String(leadId),
    );

    if (!chat || !apiMessage?.id) {
      return;
    }

    set((state) => ({
      chats: withMessageDeletedFlag(state.chats, chat.id, apiMessage.id, true),
    }));
  },

  // GAP: .messages.read has no participant id to match against — data stored (lastReadByParticipantId) but no UI reads it yet.
  receiveLeadMessagesRead: (leadId, participantId, chatType = "lead") => {
    const chat = get().chats.find(
      (item) => item.entityType === chatType && String(item.entityId) === String(leadId),
    );

    if (!chat) {
      return;
    }

    set((state) => ({
      chats: state.chats.map((item) =>
        item.id === chat.id ? { ...item, lastReadByParticipantId: participantId } : item,
      ),
    }));
  },

  reportChatWsError: (leadId, error, chatType = "lead") => {
    console.warn(`ChatWS: live updates unavailable for ${chatType} chat ${leadId}`, error);
  },

  getActiveChat: () => {
    const { chats, activeChatId } = get();
    return chats.find((chat) => chat.id === activeChatId) || null;
  },
}));

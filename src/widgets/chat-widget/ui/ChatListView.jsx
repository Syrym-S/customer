import { useEffect, useRef } from "react";
import { Alert, Badge, Box, CircularProgress, Tab, Tabs, Typography } from "@mui/material";
import { useChatStore } from "../model/chat.store";
import {
  formatRelativeTime,
  getCategoryUnreadCount,
  getChatsByCategory,
  getLastMessage,
  truncateText,
} from "../model/chat.helpers";
import { CHAT_CATEGORIES } from "../model/chat.mock";
import { CounterpartAvatar } from "./CounterpartAvatar";

const LOAD_MORE_LEAD_CHATS_SCROLL_THRESHOLD_PX = 80;

export function ChatListView() {
  const chats = useChatStore((state) => state.chats);
  const activeCategory = useChatStore((state) => state.activeCategory);
  const setActiveCategory = useChatStore((state) => state.setActiveCategory);
  const openChat = useChatStore((state) => state.openChat);
  const openLeadChat = useChatStore((state) => state.openLeadChat);
  const openFactoringChat = useChatStore((state) => state.openFactoringChat);
  const openDeliveryChat = useChatStore((state) => state.openDeliveryChat);
  const leadChatsStatus = useChatStore((state) => state.leadChatsStatus);
  const leadChatsError = useChatStore((state) => state.leadChatsError);
  const loadLeadChats = useChatStore((state) => state.loadLeadChats);
  const hasMoreLeadChats = useChatStore((state) => state.hasMoreLeadChats);
  const isLoadingMoreLeadChats = useChatStore((state) => state.isLoadingMoreLeadChats);
  const loadMoreLeadChats = useChatStore((state) => state.loadMoreLeadChats);

  const listScrollRef = useRef(null);

  useEffect(() => {
    if (leadChatsStatus === "idle") {
      loadLeadChats();
    }
  }, [leadChatsStatus, loadLeadChats]);

  const categoryChats = getChatsByCategory(chats, activeCategory);
  const isLoadingLeadChats = leadChatsStatus === "loading";
  const hasLeadChatsError = leadChatsStatus === "error";

  function handleScroll(event) {
    if (
      leadChatsStatus !== "loaded" ||
      !hasMoreLeadChats ||
      isLoadingMoreLeadChats
    ) {
      return;
    }

    const container = event.currentTarget;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    if (distanceFromBottom > LOAD_MORE_LEAD_CHATS_SCROLL_THRESHOLD_PX) {
      return;
    }

    loadMoreLeadChats();
  }

  function handleChatClick(chat) {
    if (chat.entityType === "lead") {
      openLeadChat(chat.entityId, chat.counterpart, chat.routeSummary);
      return;
    }

    if (chat.entityType === "factoring") {
      openFactoringChat(chat.entityId, chat.counterpart, chat.apiEntityId);
      return;
    }

    if (chat.entityType === "delivery") {
      openDeliveryChat(chat.entityId, chat.counterpart, chat.routeSummary);
      return;
    }

    openChat(chat.id);
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Tabs
        value={activeCategory}
        onChange={(_, value) => setActiveCategory(value)}
        variant="fullWidth"
        sx={{ minHeight: 40, borderBottom: "1px solid", borderColor: "divider" }}
      >
        {CHAT_CATEGORIES.map((category) => {
          const unreadCount = getCategoryUnreadCount(chats, category.key);

          return (
            <Tab
              key={category.key}
              value={category.key}
              sx={{ minHeight: 40, py: 1, fontSize: 13, textTransform: "none" }}
              label={
                <Badge
                  badgeContent={unreadCount}
                  color="error"
                  invisible={unreadCount === 0}
                  sx={{ "& .MuiBadge-badge": { right: -10 } }}
                >
                  {category.label}
                </Badge>
              }
            />
          );
        })}
      </Tabs>

      <Box ref={listScrollRef} onScroll={handleScroll} sx={{ flex: 1, overflowY: "auto" }}>
        {isLoadingLeadChats && categoryChats.length === 0 ? (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 3,
            }}
          >
            <CircularProgress size={28} />
          </Box>
        ) : hasLeadChatsError && categoryChats.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <Alert severity="error">
              {leadChatsError || "Не удалось загрузить чаты"}
            </Alert>
          </Box>
        ) : categoryChats.length === 0 ? (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 3,
            }}
          >
            <Typography color="text.secondary" sx={{ fontSize: 13, textAlign: "center" }}>
              Нет активных чатов
            </Typography>
          </Box>
        ) : (
          categoryChats.map((chat) => {
            const lastMessage = getLastMessage(chat);

            return (
              <Box
                key={chat.id}
                onClick={() => handleChatClick(chat)}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1,
                  px: 2,
                  py: 1.25,
                  cursor: "pointer",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  backgroundColor:
                    chat.unreadCount > 0 ? "rgba(33, 150, 243, 0.06)" : "transparent",
                  "&:hover": {
                    backgroundColor: "rgba(33, 150, 243, 0.08)",
                  },
                }}
              >
                <CounterpartAvatar counterpart={chat.counterpart} size={36} />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      gap: 1,
                    }}
                  >
                    <Typography
                      noWrap
                      sx={{ fontSize: 14, fontWeight: 600 }}
                    >
                      {chat.counterpart.name}
                    </Typography>

                    <Typography
                      component="span"
                      color="text.disabled"
                      sx={{ fontSize: 11, flexShrink: 0 }}
                    >
                      {formatRelativeTime(chat.lastActivityAt)}
                    </Typography>
                  </Box>

                  {chat.routeSummary && (
                    <Typography
                      noWrap
                      color="text.secondary"
                      sx={{ fontSize: 11, fontWeight: 500 }}
                    >
                      {chat.routeSummary}
                    </Typography>
                  )}

                  <Typography
                    color="text.secondary"
                    sx={{ fontSize: 11, mb: 0.25 }}
                  >
                    {chat.counterpart.role}
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      noWrap
                      color="text.secondary"
                      sx={{
                        fontSize: 13,
                        flex: 1,
                        fontStyle: lastMessage && !lastMessage.text ? "italic" : "normal",
                      }}
                    >
                      {lastMessage
                        ? lastMessage.text
                          ? truncateText(lastMessage.text, 42)
                          : "Вложение"
                        : ""}
                    </Typography>

                    {chat.unreadCount > 0 && (
                      <Box
                        sx={{
                          flexShrink: 0,
                          minWidth: 18,
                          height: 18,
                          px: 0.5,
                          borderRadius: "9px",
                          backgroundColor: "error.main",
                          color: "error.contrastText",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {chat.unreadCount}
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })
        )}

        {isLoadingMoreLeadChats && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 1.5 }}>
            <CircularProgress size={20} />
          </Box>
        )}
      </Box>
    </Box>
  );
}

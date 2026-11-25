import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Badge, Box, Drawer, Fab, Grow, IconButton, Paper, Typography, useTheme } from "@mui/material";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { useChatStore } from "../model/chat.store";
import { getTotalUnreadCount } from "../model/chat.helpers";
import { ChatListView } from "./ChatListView";
import { ChatListSkeleton } from '../../../shared/ui/skeletons/ChatListSkeleton';
import { ChatDetailView } from "./ChatDetailView";
import { isNative } from "../../../shared/config/platform";
import { useBackHandler } from "../../../shared/model/useBackHandler";
import { useCloseOnRouteChange } from "../../../shared/model/useCloseOnRouteChange";

const UNREAD_CHATS_POLL_INTERVAL_MS = 60 * 1000;

export function ChatWidget() {
  const { t } = useTranslation();

  const theme = useTheme();
  const isOpen = useChatStore((state) => state.isOpen);
  const toggleWidget = useChatStore((state) => state.toggleWidget);
  const closeWidget = useChatStore((state) => state.closeWidget);
  const backToList = useChatStore((state) => state.backToList);
  const chats = useChatStore((state) => state.chats);
  const activeChatId = useChatStore((state) => state.activeChatId);
  const pendingLeadChatLeadId = useChatStore((state) => state.pendingLeadChatLeadId);
  const leadChatsStatus = useChatStore((state) => state.leadChatsStatus);
  const loadLeadChats = useChatStore((state) => state.loadLeadChats);

  const totalUnreadCount = getTotalUnreadCount(chats);
  const activeChat = chats.find((chat) => chat.id === activeChatId) || null;
  const isLoadingSingleLeadChat = Boolean(pendingLeadChatLeadId) && !activeChat;
  const isLoadingLeadChats = leadChatsStatus === "loading";

  // Loads the unread badge count on app mount, then keeps it fresh with
  // polling — without this, the count previously only appeared after the
  // user opened (and closed) the widget once, since toggleWidget() was the
  // sole trigger for loadLeadChats(). loadLeadChats() already no-ops while
  // a fetch is in flight, so an immediate open right after mount can't fire
  // a duplicate request.
  useEffect(() => {
    loadLeadChats();

    const intervalId = setInterval(loadLeadChats, UNREAD_CHATS_POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [loadLeadChats]);

  // На полном экране чат перекрывает весь контент, поэтому аппаратная "назад"
  // сначала возвращает в список, потом закрывает панель, и только затем уходит
  // по истории роутера. На вебе useBackHandler сам себя отключает.
  useBackHandler(isOpen ? (activeChat ? backToList : closeWidget) : null);

  useCloseOnRouteChange(isNative ? closeWidget : undefined);

  const listHeader = !activeChat && !isLoadingSingleLeadChat && (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        pl: 2,
        pr: 1,
        py: isNative ? 1 : 1.25,
        pt: isNative ? "calc(var(--safe-top) + 8px)" : 1.25,
        borderBottom: "1px solid",
        borderColor: "divider",
        flexShrink: 0,
      }}
    >
      <Typography sx={{ fontSize: isNative ? 16 : 15, fontWeight: 700 }}>
        {t("chat.title")}
      </Typography>

      <IconButton
        size="small"
        onClick={() => loadLeadChats()}
        disabled={isLoadingLeadChats}
        aria-label={t("chat.refreshList")}
      >
        <RefreshRoundedIcon fontSize="small" />
      </IconButton>
    </Box>
  );

  const panelBody = (
    <Box sx={{ flex: 1, minHeight: 0 }}>
      {activeChat ? (
        <ChatDetailView chat={activeChat} />
      ) : isLoadingSingleLeadChat ? (
        // Пока тянется чат конкретной сделки, показываем форму
        // строк списка вместо спиннера на всю панель.
        <ChatListSkeleton />
      ) : (
        <ChatListView />
      )}
    </Box>
  );

  const fabBadge = (
    <Badge
      badgeContent={totalUnreadCount}
      color="error"
      invisible={totalUnreadCount === 0 || isOpen}
    >
      {isOpen ? <CloseRoundedIcon /> : <ChatBubbleRoundedIcon />}
    </Badge>
  );

  if (isNative) {
    return (
      <>
        {!activeChat && (
          <Fab
            color="primary"
            onClick={toggleWidget}
            aria-label={isOpen ? t("chat.close") : t("chat.open")}
            sx={{
              position: "fixed",
              right: 16,
              bottom: "calc(16px + var(--safe-bottom))",
              zIndex: 1300,
            }}
          >
            {fabBadge}
          </Fab>
        )}

        <Drawer
          anchor="right"
          open={isOpen}
          onClose={closeWidget}
          slotProps={{
            transition: {
              direction: "up",
            },
            root: {
              sx: {
                zIndex: 1250,
              },
            },
            paper: {
              sx: {
                height: "100dvh",
                width: "100%",
                maxWidth: "100vw",
                display: "flex",
                flexDirection: "column",
                // Глобальный MuiPaper.root в теме даёт radius 12 — на полном
                // экране скруглённые углы оставляли бы просветы по краям.
                borderRadius: 0,
              },
            },
          }}
        >
          {listHeader}

          {panelBody}
        </Drawer>
      </>
    );
  }

  return (
    <Box
      sx={{
        position: "fixed",
        right: { xs: 16, sm: 24 },
        bottom: { xs: 16, sm: 24 },
        zIndex: (theme) => theme.zIndex.modal - 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 1.5,
      }}
    >
      <Grow
        in={isOpen}
        appear
        unmountOnExit
        easing={{
          enter: theme.transitions.easing.easeOut,
          exit: theme.transitions.easing.sharp,
        }}
        timeout={{ enter: 220, exit: 200 }}
        style={{ transformOrigin: "bottom right" }}
      >
        <Paper
          elevation={6}
          sx={{
            width: 460,
            maxWidth: "calc(100vw - 32px)",
            height: 560,
            maxHeight: "calc(100vh - 120px)",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          {listHeader}

          {panelBody}
        </Paper>
      </Grow>

      <Fab
        color="primary"
        onClick={toggleWidget}
        aria-label={isOpen ? t("chat.close") : t("chat.open")}
      >
        {fabBadge}
      </Fab>
    </Box>
  );
}

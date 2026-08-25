import { Badge, Box, CircularProgress, Fab, Grow, Paper, Typography, useTheme } from "@mui/material";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useChatStore } from "../model/chat.store";
import { getTotalUnreadCount } from "../model/chat.helpers";
import { ChatListView } from "./ChatListView";
import { ChatDetailView } from "./ChatDetailView";

export function ChatWidget() {
  const theme = useTheme();
  const isOpen = useChatStore((state) => state.isOpen);
  const toggleWidget = useChatStore((state) => state.toggleWidget);
  const chats = useChatStore((state) => state.chats);
  const activeChatId = useChatStore((state) => state.activeChatId);
  const pendingLeadChatLeadId = useChatStore((state) => state.pendingLeadChatLeadId);

  const totalUnreadCount = getTotalUnreadCount(chats);
  const activeChat = chats.find((chat) => chat.id === activeChatId) || null;
  const isLoadingSingleLeadChat = Boolean(pendingLeadChatLeadId) && !activeChat;

  return (
    <Box
      sx={{
        position: "fixed",
        right: { xs: 16, sm: 24 },
        bottom: { xs: 16, sm: 24 },
        zIndex: (theme) => theme.zIndex.snackbar,
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
            width: 380,
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
          {!activeChat && !isLoadingSingleLeadChat && (
            <Box
              sx={{
                px: 2,
                py: 1.25,
                borderBottom: "1px solid",
                borderColor: "divider",
                flexShrink: 0,
              }}
            >
              <Typography sx={{ fontSize: 15, fontWeight: 700 }}>Чаты</Typography>
            </Box>
          )}

          <Box sx={{ flex: 1, minHeight: 0 }}>
            {activeChat ? (
              <ChatDetailView chat={activeChat} />
            ) : isLoadingSingleLeadChat ? (
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CircularProgress size={28} />
              </Box>
            ) : (
              <ChatListView />
            )}
          </Box>
        </Paper>
      </Grow>

      <Fab
        color="primary"
        onClick={toggleWidget}
        aria-label={isOpen ? "Закрыть чат" : "Открыть чат"}
      >
        <Badge
          badgeContent={totalUnreadCount}
          color="error"
          invisible={totalUnreadCount === 0 || isOpen}
        >
          {isOpen ? <CloseRoundedIcon /> : <ChatBubbleRoundedIcon />}
        </Badge>
      </Fab>
    </Box>
  );
}

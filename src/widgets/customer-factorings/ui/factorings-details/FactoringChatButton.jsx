import { useState } from "react";
import { Badge, Button, CircularProgress } from "@mui/material";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import PropTypes from "prop-types";

import { useChatStore } from "../../../chat-widget/model/chat.store";
import {
  getEntityChats,
  getTotalUnreadCount,
} from "../../../chat-widget/model/chat.helpers";
import { fetchCustomerFactoringById } from "../../api/factorings.api";
import { getFactoringLeadId } from "../../model/factorings.helpers";
import { notifyError } from "../../../../shared/model/notifications.store";

export function FactoringChatButton({ factoringId, factoring, onClose }) {
  const chats = useChatStore((state) => state.chats);
  const openFactoringChat = useChatStore((state) => state.openFactoringChat);
  const [isResolvingChat, setIsResolvingChat] = useState(false);

  const factoringUnreadCount = getTotalUnreadCount(
    getEntityChats(chats, "factoring", factoringId),
  );

  async function handleClick() {
    if (isResolvingChat) {
      return;
    }

    const counterpart = {
      name: `Факторинг #${factoringId}`,
      role: "Факторинг",
    };

    const knownLeadId = getFactoringLeadId(factoring);

    if (knownLeadId) {
      onClose?.();
      openFactoringChat(factoringId, counterpart, knownLeadId);
      return;
    }

    setIsResolvingChat(true);

    try {
      const details = await fetchCustomerFactoringById(factoringId);
      const leadId = getFactoringLeadId(details);

      if (!leadId) {
        throw new Error("Не удалось определить лид, связанный с факторингом");
      }

      onClose?.();
      openFactoringChat(factoringId, counterpart, leadId);
    } catch (error) {
      notifyError(
        error.response?.data?.message ||
          error.message ||
          "Не удалось открыть чат по факторингу",
      );
    } finally {
      setIsResolvingChat(false);
    }
  }

  return (
    <Button
      variant="outlined"
      startIcon={
        isResolvingChat ? (
          <CircularProgress size={16} />
        ) : (
          <Badge
            badgeContent={factoringUnreadCount}
            color="error"
            invisible={factoringUnreadCount === 0}
          >
            <ChatBubbleOutlineRoundedIcon fontSize="small" />
          </Badge>
        )
      }
      onClick={handleClick}
      disabled={isResolvingChat}
    >
      Чат
    </Button>
  );
}

FactoringChatButton.propTypes = {
  factoringId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  factoring: PropTypes.object,
  onClose: PropTypes.func,
};

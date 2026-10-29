import { useState } from "react";
import { useTranslation } from "react-i18next";
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
import { truncateId } from "../../../../shared/helpers/data-grid.helpers";

export function FactoringChatButton({ factoringId, factoring, onClose }) {
  const { t } = useTranslation();

  const chats = useChatStore((state) => state.chats);
  const openFactoringChat = useChatStore((state) => state.openFactoringChat);
  const [isResolvingChat, setIsResolvingChat] = useState(false);

  const knownLeadId = getFactoringLeadId(factoring);

  const factoringUnreadCount = getTotalUnreadCount(
    getEntityChats(chats, "factoring", knownLeadId),
  );

  async function handleClick() {
    if (isResolvingChat) {
      return;
    }

    if (knownLeadId) {
      onClose?.();
      openFactoringChat(knownLeadId, { name: t("factorings.details.number", { id: truncateId(knownLeadId) }), role: t("factorings.titleSingular") });
      return;
    }

    setIsResolvingChat(true);

    try {
      const details = await fetchCustomerFactoringById(factoringId);
      const leadId = getFactoringLeadId(details);

      if (!leadId) {
        throw new Error(t("factorings.chat.leadNotResolved"));
      }

      onClose?.();
      openFactoringChat(leadId, { name: t("factorings.details.number", { id: truncateId(leadId) }), role: t("factorings.titleSingular") });
    } catch (error) {
      notifyError(
        error.response?.data?.message ||
          error.message ||
          t("factorings.chat.openFailed"),
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
      {t("factorings.chat.action")}
    </Button>
  );
}

FactoringChatButton.propTypes = {
  factoringId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  factoring: PropTypes.object,
  onClose: PropTypes.func,
};

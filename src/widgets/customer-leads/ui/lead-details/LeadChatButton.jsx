import { Badge, Button } from "@mui/material";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import PropTypes from "prop-types";

import { useChatStore } from "../../../chat-widget/model/chat.store";
import {
  getEntityChats,
  getTotalUnreadCount,
} from "../../../chat-widget/model/chat.helpers";
import {
  buildLeadCounterpartFromLead,
  buildLeadRouteSummary,
} from "../../../chat-widget/model/chat.mappers";

export function LeadChatButton({ lead, onClose }) {
  const leadId = lead?.id;
  const chats = useChatStore((state) => state.chats);
  const openLeadChat = useChatStore((state) => state.openLeadChat);

  const leadUnreadCount = getTotalUnreadCount(
    getEntityChats(chats, "lead", leadId),
  );

  function handleClick() {
    onClose?.();
    openLeadChat(leadId, buildLeadCounterpartFromLead(lead), buildLeadRouteSummary(lead));
  }

  return (
    <Button
      variant="outlined"
      startIcon={
        <Badge
          badgeContent={leadUnreadCount}
          color="error"
          invisible={leadUnreadCount === 0}
        >
          <ChatBubbleOutlineRoundedIcon fontSize="small" />
        </Badge>
      }
      onClick={handleClick}
    >
      Чат
    </Button>
  );
}

LeadChatButton.propTypes = {
  lead: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  onClose: PropTypes.func,
};

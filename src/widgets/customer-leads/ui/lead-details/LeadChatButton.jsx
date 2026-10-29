import { Badge, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  const leadId = lead?.id;
  const chats = useChatStore((state) => state.chats);
  const openLeadChat = useChatStore((state) => state.openLeadChat);

  const leadUnreadCount = getTotalUnreadCount(
    getEntityChats(chats, "lead", leadId),
  );

  if (!lead?.forwarder) {
    return null;
  }

  function handleClick() {
    onClose?.();
    openLeadChat(leadId, buildLeadCounterpartFromLead(lead), buildLeadRouteSummary(lead));
  }

  return (
    <Button
      variant="outlined"
      color="info"
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
      sx={{
        textTransform: 'none',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        fontSize: { xs: 12, sm: '0.875rem' },
        px: { xs: 1.25, sm: 2 },
        '& .MuiButton-startIcon': {
          mr: { xs: 0.5, sm: 1 },
        },
      }}
    >
      {t("leads.chat.withForwarder")}
    </Button>
  );
}

LeadChatButton.propTypes = {
  lead: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  onClose: PropTypes.func,
};

import { Badge, Button } from "@mui/material";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import PropTypes from "prop-types";

import { useChatStore } from "../../../chat-widget/model/chat.store";
import {
  getEntityChats,
  getTotalUnreadCount,
} from "../../../chat-widget/model/chat.helpers";
import {
  buildDriverCounterpartFromLead,
  buildLeadRouteSummary,
} from "../../../chat-widget/model/chat.mappers";

export function LeadDeliveryChatButton({ lead, onClose }) {
  const leadId = lead?.id;
  const chats = useChatStore((state) => state.chats);
  const openDeliveryChat = useChatStore((state) => state.openDeliveryChat);

  const deliveryUnreadCount = getTotalUnreadCount(
    getEntityChats(chats, "delivery", leadId),
  );

  const driverCounterpart = buildDriverCounterpartFromLead(lead);

  if (!driverCounterpart) {
    return null;
  }

  function handleClick() {
    onClose?.();
    openDeliveryChat(leadId, driverCounterpart, buildLeadRouteSummary(lead));
  }

  return (
    <Button
      variant="outlined"
      color="secondary"
      startIcon={
        <Badge
          badgeContent={deliveryUnreadCount}
          color="error"
          invisible={deliveryUnreadCount === 0}
        >
          <ChatBubbleOutlineRoundedIcon fontSize="small" />
        </Badge>
      }
      onClick={handleClick}
      sx={{ textTransform: 'none' }}
    >
      Чат с водителем
    </Button>
  );
}

LeadDeliveryChatButton.propTypes = {
  lead: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  onClose: PropTypes.func,
};

import { Box, Button, IconButton, Tooltip } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PropTypes from 'prop-types';

import { LeadShareButton } from './LeadShareButton';
import { LeadChatButton } from './LeadChatButton';
import { LeadDeliveryChatButton } from './LeadDeliveryChatButton';
import {
   isFinishedLead,
   isCancelledLead,
   isDraftLead,
   isDraftPublishable,
   isEmergencyLead,
   isFinishedEmergencyLead,
   isSignAvrLead,
} from '../../model/lead.helpers';

export function LeadDetailsEditActions({
   lead,
   leadId,
   isEditing,
   onStartEdit,
   onCancelEdit,
   onClose,
   onPublishDraft,
   isPublishing = false,
}) {
   const isDraft = isDraftLead(lead);
   const canPublishDraft = isDraftPublishable(lead);

   const isEditDisabled =
      !isDraft &&
      (isFinishedLead(lead) ||
         isCancelledLead(lead) ||
         isEmergencyLead(lead) ||
         isFinishedEmergencyLead(lead) ||
         isSignAvrLead(lead));

   const editTooltipTitle = isDraft
      ? 'Изменить'
      : isEmergencyLead(lead)
        ? 'Нельзя редактировать заказ в аварийной ситуации'
        : isFinishedEmergencyLead(lead)
          ? 'Нельзя редактировать заказ, завершенный в аварийной ситуации'
          : isEditDisabled
            ? 'Нельзя редактировать завершенный или отмененный заказ'
            : 'Изменить';

   const publishTooltipTitle = canPublishDraft
      ? ''
      : 'Заполните маршрут и груз перед публикацией';

   return (
      <Box
         sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1,
            mb: 2,
         }}
      >
         {!isDraft && !isEditing && lead && <LeadChatButton lead={lead} onClose={onClose} />}

         {!isDraft && !isEditing && lead && <LeadDeliveryChatButton lead={lead} onClose={onClose} />}

         {!isDraft && !isEditing && leadId && <LeadShareButton leadId={leadId} />}

         {isEditing ? (
            <Button onClick={onCancelEdit}>Отмена</Button>
         ) : (
            <>
               <Tooltip title={editTooltipTitle}>
                  <span>
                     <IconButton
                        color="primary"
                        aria-label="Изменить"
                        onClick={onStartEdit}
                        disabled={isEditDisabled}
                     >
                        <EditOutlinedIcon fontSize="small" />
                     </IconButton>
                  </span>
               </Tooltip>

               {isDraft && (
                  <Tooltip title={publishTooltipTitle}>
                     <span>
                        <Button
                           variant="contained"
                           onClick={onPublishDraft}
                           disabled={isPublishing || !canPublishDraft}
                        >
                           {isPublishing ? 'Публикация...' : 'Опубликовать'}
                        </Button>
                     </span>
                  </Tooltip>
               )}
            </>
         )}
      </Box>
   );
}

LeadDetailsEditActions.propTypes = {
   lead: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
   }),
   leadId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
   isEditing: PropTypes.bool.isRequired,
   onStartEdit: PropTypes.func.isRequired,
   onCancelEdit: PropTypes.func.isRequired,
   onClose: PropTypes.func,
   onPublishDraft: PropTypes.func,
   isPublishing: PropTypes.bool,
};

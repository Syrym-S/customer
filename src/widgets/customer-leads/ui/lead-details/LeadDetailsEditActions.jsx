import { Box, Button, IconButton, Tooltip } from '@mui/material';
import { useTranslation } from "react-i18next";
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

const ACTIONS_ROW_BREAKPOINT = 480;

const ACTIONS_ROW_SX = (theme) => ({
   display: 'flex',
   alignItems: 'center',
   justifyContent: 'flex-end',
   flexWrap: 'wrap',
   gap: 1,
   '&:empty': {
      display: 'none',
   },
   [theme.breakpoints.down(ACTIONS_ROW_BREAKPOINT)]: {
      width: '100%',
   },
});

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
   const { t } = useTranslation();

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
      ? t("common.actions.edit")
      : isEmergencyLead(lead)
        ? t("leads.edit.blockedEmergency")
        : isFinishedEmergencyLead(lead)
          ? t("leads.edit.blockedFinishedEmergency")
          : isEditDisabled
            ? t("leads.edit.blockedFinished")
            : t("common.actions.edit");

   const publishTooltipTitle = canPublishDraft
      ? ''
      : t("leads.publish.fillRouteAndCargo");

   return (
      <Box
         sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            flexWrap: 'wrap',
            gap: 1,
            mb: 2,
         }}
      >
         {!isDraft && !isEditing && lead && (
            <Box sx={ACTIONS_ROW_SX}>
               <LeadChatButton lead={lead} onClose={onClose} />

               <LeadDeliveryChatButton lead={lead} onClose={onClose} />
            </Box>
         )}

         <Box sx={ACTIONS_ROW_SX}>
            {!isDraft && !isEditing && leadId && <LeadShareButton leadId={leadId} />}

            {isEditing ? (
               <Button onClick={onCancelEdit}>{t("common.actions.cancel")}</Button>
            ) : (
               <>
                  <Tooltip title={editTooltipTitle}>
                     <span style={{ display: 'inline-flex' }}>
                        <IconButton
                           color="primary"
                           aria-label={t("common.actions.edit")}
                           onClick={onStartEdit}
                           disabled={isEditDisabled}
                        >
                           <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                     </span>
                  </Tooltip>

                  {isDraft && (
                     <Tooltip title={publishTooltipTitle}>
                        <span style={{ display: 'inline-flex' }}>
                           <Button
                              variant="contained"
                              onClick={onPublishDraft}
                              disabled={isPublishing || !canPublishDraft}
                           >
                              {isPublishing ? t("leads.publish.inProgress") : t("leads.publish.action")}
                           </Button>
                        </span>
                     </Tooltip>
                  )}
               </>
            )}
         </Box>
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

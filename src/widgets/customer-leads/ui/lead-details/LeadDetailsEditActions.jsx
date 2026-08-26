import { Box, Button, IconButton, Tooltip } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PropTypes from 'prop-types';

import { LeadShareButton } from './LeadShareButton';
import { LeadChatButton } from './LeadChatButton';
import { LeadDeliveryChatButton } from './LeadDeliveryChatButton';

export function LeadDetailsEditActions({
   lead,
   leadId,
   isEditing,
   onStartEdit,
   onCancelEdit,
   onClose,
}) {
   return (
      <Box
         sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1,
            mb: 2,
         }}
      >
         {!isEditing && lead && <LeadChatButton lead={lead} onClose={onClose} />}

         {!isEditing && lead && <LeadDeliveryChatButton lead={lead} onClose={onClose} />}

         {!isEditing && leadId && <LeadShareButton leadId={leadId} />}

         {isEditing ? (
            <Button onClick={onCancelEdit}>Отмена</Button>
         ) : (
            <Tooltip title="Изменить">
               <IconButton color="primary" aria-label="Изменить" onClick={onStartEdit}>
                  <EditOutlinedIcon fontSize="small" />
               </IconButton>
            </Tooltip>
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
};

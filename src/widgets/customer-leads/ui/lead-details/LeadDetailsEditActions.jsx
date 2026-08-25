import { Box, Button } from '@mui/material';
import PropTypes from 'prop-types';

import { LeadShareButton } from './LeadShareButton';
import { LeadChatButton } from './LeadChatButton';

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

         {!isEditing && leadId && <LeadShareButton leadId={leadId} />}

         {isEditing ? (
            <Button onClick={onCancelEdit}>Отмена</Button>
         ) : (
            <Button variant='outlined' onClick={onStartEdit}>
               Изменить
            </Button>
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

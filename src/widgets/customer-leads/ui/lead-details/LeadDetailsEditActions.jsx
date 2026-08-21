import { Box, Button } from '@mui/material';
import PropTypes from 'prop-types';

import { LeadShareButton } from './LeadShareButton';

export function LeadDetailsEditActions({
   leadId,
   isEditing,
   onStartEdit,
   onCancelEdit,
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
   leadId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
   isEditing: PropTypes.bool.isRequired,
   onStartEdit: PropTypes.func.isRequired,
   onCancelEdit: PropTypes.func.isRequired,
};

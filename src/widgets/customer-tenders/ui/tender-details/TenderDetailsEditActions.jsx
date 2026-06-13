import { Box, Button } from '@mui/material';
import PropTypes from 'prop-types';

export function TenderDetailsEditActions({
   isEditing,
   onStartEdit,
   onCancelEdit,
}) {
   return (
      <Box
         sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            mb: 2,
         }}
      >
         {isEditing ? (
            <Button variant='outlined' onClick={onCancelEdit}>
               Отмена
            </Button>
         ) : (
            <Button variant='outlined' onClick={onStartEdit}>
               Изменить
            </Button>
         )}
      </Box>
   );
}

TenderDetailsEditActions.propTypes = {
   isEditing: PropTypes.bool.isRequired,
   onStartEdit: PropTypes.func.isRequired,
   onCancelEdit: PropTypes.func.isRequired,
};

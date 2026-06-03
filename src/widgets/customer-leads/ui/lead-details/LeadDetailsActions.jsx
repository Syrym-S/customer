import { Button, DialogActions } from '@mui/material';
import PropTypes from 'prop-types';

export function LeadDetailsActions({ isEditing, onSave, onClose }) {
   return (
      <DialogActions
         sx={{
            px: 3,
            pb: 3,
            pt: 2,
            justifyContent: 'flex-end',
            gap: 1,
         }}
      >
         {isEditing && (
            <Button variant='contained' onClick={onSave}>
               Сохранить
            </Button>
         )}

         <Button onClick={onClose}>Закрыть</Button>
      </DialogActions>
   );
}

LeadDetailsActions.propTypes = {
   isEditing: PropTypes.bool.isRequired,
   onSave: PropTypes.func.isRequired,
   onClose: PropTypes.func.isRequired,
};

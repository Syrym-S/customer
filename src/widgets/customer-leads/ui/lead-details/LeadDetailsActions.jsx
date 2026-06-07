import { Button, DialogActions } from '@mui/material';
import PropTypes from 'prop-types';

export function LeadDetailsActions({
   isEditing,
   isSaving = false,
   onSave,
   onClose,
}) {
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
            <Button variant='contained' onClick={onSave} disabled={isSaving}>
               {isSaving ? 'Сохранение...' : 'Сохранить'}
            </Button>
         )}

         <Button onClick={onClose} disabled={isSaving}>
            Закрыть
         </Button>
      </DialogActions>
   );
}

LeadDetailsActions.propTypes = {
   isEditing: PropTypes.bool.isRequired,
   isSaving: PropTypes.bool,
   onSave: PropTypes.func.isRequired,
   onClose: PropTypes.func.isRequired,
};

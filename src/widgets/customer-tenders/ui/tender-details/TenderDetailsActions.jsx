import { Button, DialogActions } from '@mui/material';
import PropTypes from 'prop-types';

export function TenderDetailsActions({
   isEditing,
   isSaving = false,
   onSave,
   onClose,
}) {
   return (
      <DialogActions sx={{ px: 3, pb: 2 }}>
         {isEditing && (
            <Button variant='contained' onClick={onSave} disabled={isSaving}>
               {isSaving ? 'Сохранение...' : 'Сохранить'}
            </Button>
         )}

         <Button onClick={onClose}>
            {isEditing ? 'Закрыть без сохранения' : 'Закрыть'}
         </Button>
      </DialogActions>
   );
}

TenderDetailsActions.propTypes = {
   isEditing: PropTypes.bool.isRequired,
   isSaving: PropTypes.bool,
   onSave: PropTypes.func.isRequired,
   onClose: PropTypes.func.isRequired,
};

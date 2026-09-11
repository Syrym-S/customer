import { Button, DialogActions } from '@mui/material';
import PropTypes from 'prop-types';

export function LeadDetailsActions({ isEditing, isSaving = false, onSave }) {
   if (!isEditing) {
      return null;
   }

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
         <Button variant='contained' onClick={onSave} disabled={isSaving}>
            {isSaving ? 'Сохранение...' : 'Сохранить'}
         </Button>
      </DialogActions>
   );
}

LeadDetailsActions.propTypes = {
   isEditing: PropTypes.bool.isRequired,
   isSaving: PropTypes.bool,
   onSave: PropTypes.func.isRequired,
};

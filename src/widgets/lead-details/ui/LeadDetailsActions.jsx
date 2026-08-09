import { Button, DialogActions } from '@mui/material';

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


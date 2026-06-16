import { Button, DialogActions } from '@mui/material';
import PropTypes from 'prop-types';
import { tenderPropType } from '../../model/tenders.propTypes';

export function TenderDetailsActions({
   tender,
   isEditing,
   isSaving = false,
   isActionLoading = false,
   onSave,
   onClose,
   onStartTender,
   onCancelTender,
   onDeleteTender,
}) {
   const isTenderEditableActionAvailable =
      tender?.status !== 'closed' && tender?.status !== 'cancelled';

   return (
      <DialogActions
         sx={{
            px: 3,
            pb: 2,
            pt: 2,
            justifyContent: 'space-between',
            gap: 1,
            flexWrap: 'wrap',
            borderTop: '1px solid',
            borderColor: 'divider',
         }}
      >
         <div
            style={{
               display: 'flex',
               gap: 8,
               flexWrap: 'wrap',
            }}
         >
            {!isEditing && tender?.status === 'new' && (
               <Button
                  color='success'
                  variant='contained'
                  onClick={onStartTender}
                  disabled={isActionLoading}
               >
                  Запустить тендер
               </Button>
            )}

            {!isEditing && isTenderEditableActionAvailable && (
               <Button
                  color='warning'
                  variant='outlined'
                  onClick={onCancelTender}
                  disabled={isActionLoading}
               >
                  Отменить тендер
               </Button>
            )}

            {!isEditing && (
               <Button
                  color='error'
                  variant='outlined'
                  onClick={onDeleteTender}
                  disabled={isActionLoading}
               >
                  Удалить тендер
               </Button>
            )}
         </div>

         <div
            style={{
               display: 'flex',
               gap: 8,
               flexWrap: 'wrap',
            }}
         >
            {isEditing && (
               <Button variant='contained' onClick={onSave} disabled={isSaving}>
                  {isSaving ? 'Сохранение...' : 'Сохранить'}
               </Button>
            )}

            <Button onClick={onClose} disabled={isSaving || isActionLoading}>
               Закрыть
            </Button>
         </div>
      </DialogActions>
   );
}

TenderDetailsActions.propTypes = {
   tender: tenderPropType,
   isEditing: PropTypes.bool.isRequired,
   isSaving: PropTypes.bool,
   isActionLoading: PropTypes.bool,
   onSave: PropTypes.func.isRequired,
   onClose: PropTypes.func.isRequired,
   onStartTender: PropTypes.func,
   onCancelTender: PropTypes.func,
   onDeleteTender: PropTypes.func,
};

import {
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogContentText,
   DialogTitle,
} from '@mui/material';
import PropTypes from 'prop-types';
import { tenderPropType } from '../../model/tenders.prop-types';
import { useState } from 'react';

const confirmActionConfig = {
   cancel: {
      title: 'Отменить тендер',
      text: 'Вы уверены, что хотите отменить этот тендер? После отмены он станет недоступен для участников.',
      confirmText: 'Отменить тендер',
      loadingText: 'Отмена...',
      color: 'warning',
   },
   delete: {
      title: 'Удалить тендер',
      text: 'Вы уверены, что хотите удалить этот тендер? Это действие нельзя будет отменить.',
      confirmText: 'Удалить тендер',
      loadingText: 'Удаление...',
      color: 'error',
   },
};

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
   const [confirmAction, setConfirmAction] = useState(null);
   const isTenderEditableActionAvailable =
      tender?.status !== 'closed' && tender?.status !== 'cancelled';

   const confirmConfig = confirmActionConfig[confirmAction];

   function handleOpenConfirm(action, event) {
      event?.currentTarget?.blur?.();
      setConfirmAction(action);
   }

   function handleCloseConfirm() {
      if (document.activeElement instanceof HTMLElement) {
         document.activeElement.blur();
      }

      setConfirmAction(null);
   }

   async function handleConfirmAction() {
      if (!confirmAction) {
         return;
      }

      if (confirmAction === 'cancel') {
         await onCancelTender?.();
      }

      if (confirmAction === 'delete') {
         await onDeleteTender?.();
      }

      setConfirmAction(null);
   }

   return (
      <>
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
                     onClick={(event) => handleOpenConfirm('cancel', event)}
                     disabled={isActionLoading}
                  >
                     Отменить тендер
                  </Button>
               )}

               {!isEditing && (
                  <Button
                     color='error'
                     variant='outlined'
                     onClick={(event) => handleOpenConfirm('delete', event)}
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
                  <Button
                     variant='contained'
                     onClick={onSave}
                     disabled={isSaving}
                  >
                     {isSaving ? 'Сохранение...' : 'Сохранить'}
                  </Button>
               )}

               <Button onClick={onClose} disabled={isSaving || isActionLoading}>
                  Закрыть
               </Button>
            </div>
         </DialogActions>
         <Dialog open={Boolean(confirmAction)} onClose={handleCloseConfirm}>
            <DialogTitle>{confirmConfig?.title}</DialogTitle>

            <DialogContent>
               <DialogContentText>{confirmConfig?.text}</DialogContentText>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
               <Button onClick={handleCloseConfirm} disabled={isActionLoading}>
                  Отмена
               </Button>

               <Button
                  color={confirmConfig?.color}
                  variant='contained'
                  onClick={handleConfirmAction}
                  disabled={isActionLoading}
               >
                  {isActionLoading
                     ? confirmConfig?.loadingText
                     : confirmConfig?.confirmText}
               </Button>
            </DialogActions>
         </Dialog>
      </>
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

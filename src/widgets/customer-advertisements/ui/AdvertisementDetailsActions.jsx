import PropTypes from 'prop-types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
   Box,
   Button,
   DialogActions,
   DialogContent,
   DialogContentText,
   DialogTitle,
} from '@mui/material';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';

import i18n from '../../../shared/i18n';
import { AppDialog } from '../../../shared/ui/AppDialog';

function getConfirmActionConfig() {
   return {
      close: {
         title: i18n.t('advertisements.manage.close'),
         text: i18n.t('advertisements.manage.closeConfirm'),
         confirmText: i18n.t('advertisements.manage.close'),
         loadingText: i18n.t('advertisements.manage.closing'),
         color: 'warning',
      },
      delete: {
         title: i18n.t('advertisements.manage.delete'),
         text: i18n.t('advertisements.manage.deleteConfirm'),
         confirmText: i18n.t('advertisements.manage.delete'),
         loadingText: i18n.t('common.actions.deleting'),
         color: 'error',
      },
   };
}

export function AdvertisementDetailsActions({
   isClosed = false,
   isEditing = false,
   isSaving = false,
   isSaveDisabled = false,
   isActionLoading = false,
   onSave,
   onCloseAdvertisement,
   onDeleteAdvertisement,
}) {
   const { t } = useTranslation();

   const [confirmAction, setConfirmAction] = useState(null);

   const confirmConfig = getConfirmActionConfig()[confirmAction];

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

      if (confirmAction === 'close') {
         await onCloseAdvertisement?.();
      }

      if (confirmAction === 'delete') {
         await onDeleteAdvertisement?.();
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
            <Box
               sx={{
                  display: 'flex',
                  gap: 1,
                  flexWrap: 'wrap',
               }}
            >
               {!isEditing && !isClosed && (
                  <Button
                     color="warning"
                     variant="outlined"
                     startIcon={<BlockOutlinedIcon />}
                     onClick={(event) => handleOpenConfirm('close', event)}
                     disabled={isActionLoading}
                  >
                     {t('advertisements.manage.close')}
                  </Button>
               )}

               {!isEditing && (
                  <Button
                     color="error"
                     variant="outlined"
                     startIcon={<DeleteOutlinedIcon />}
                     onClick={(event) => handleOpenConfirm('delete', event)}
                     disabled={isActionLoading}
                  >
                     {t('advertisements.manage.delete')}
                  </Button>
               )}
            </Box>

            {isEditing && (
               <Button
                  variant="contained"
                  onClick={onSave}
                  disabled={isSaving || isSaveDisabled}
                  sx={{ ml: 0 }}
               >
                  {isSaving
                     ? t('common.actions.saving')
                     : t('common.actions.save')}
               </Button>
            )}
         </DialogActions>

         <AppDialog open={Boolean(confirmAction)} onClose={handleCloseConfirm}>
            <DialogTitle>{confirmConfig?.title}</DialogTitle>

            <DialogContent>
               <DialogContentText>{confirmConfig?.text}</DialogContentText>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
               <Button onClick={handleCloseConfirm} disabled={isActionLoading}>
                  {t('common.actions.cancel')}
               </Button>

               <Button
                  color={confirmConfig?.color}
                  variant="contained"
                  onClick={handleConfirmAction}
                  disabled={isActionLoading}
               >
                  {isActionLoading
                     ? confirmConfig?.loadingText
                     : confirmConfig?.confirmText}
               </Button>
            </DialogActions>
         </AppDialog>
      </>
   );
}

AdvertisementDetailsActions.propTypes = {
   isClosed: PropTypes.bool,
   isEditing: PropTypes.bool,
   isSaving: PropTypes.bool,
   isSaveDisabled: PropTypes.bool,
   isActionLoading: PropTypes.bool,
   onSave: PropTypes.func,
   onCloseAdvertisement: PropTypes.func,
   onDeleteAdvertisement: PropTypes.func,
};

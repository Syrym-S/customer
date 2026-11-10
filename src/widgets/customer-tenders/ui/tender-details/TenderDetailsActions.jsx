import {
   Button,
   DialogActions,
   DialogContent,
   DialogContentText,
   DialogTitle,
} from '@mui/material';
import i18n from '../../../../shared/i18n';
import { useTranslation } from "react-i18next";
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import PropTypes from 'prop-types';
import { tenderPropType } from '../../model/tenders.prop-types';
import { useState } from 'react';
import { AppDialog } from '../../../../shared/ui/AppDialog';

function getConfirmActionConfig() {
   return {
      cancel: {
         title: i18n.t("tenders.manage.cancel"),
         text: i18n.t("tenders.manage.cancelConfirm"),
         confirmText: i18n.t("tenders.manage.cancel"),
         loadingText: i18n.t("tenders.manage.cancelling"),
         color: 'warning',
      },
      delete: {
         title: i18n.t("tenders.manage.delete"),
         text: i18n.t("tenders.manage.deleteConfirm"),
         confirmText: i18n.t("tenders.manage.delete"),
         loadingText: i18n.t("common.actions.deleting"),
         color: 'error',
      },
   };
}

export function TenderDetailsActions({
   tender,
   isEditing,
   isSaving = false,
   isActionLoading = false,
   onSave,
   onStartTender,
   onCancelTender,
   onDeleteTender,
}) {
   const { t } = useTranslation();

   const [confirmAction, setConfirmAction] = useState(null);
   const isTenderEditableActionAvailable =
      tender?.status !== 'closed' && tender?.status !== 'cancelled';

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
                     startIcon={<PlayArrowOutlinedIcon />}
                     onClick={onStartTender}
                     disabled={isActionLoading}
                  >
                     {t("tenders.manage.start")}
                  </Button>
               )}

               {!isEditing && isTenderEditableActionAvailable && (
                  <Button
                     color='warning'
                     variant='outlined'
                     startIcon={<BlockOutlinedIcon />}
                     onClick={(event) => handleOpenConfirm('cancel', event)}
                     disabled={isActionLoading}
                  >
                     {t("tenders.manage.cancel")}
                  </Button>
               )}

               {!isEditing && (
                  <Button
                     color='error'
                     variant='outlined'
                     startIcon={<DeleteOutlinedIcon />}
                     onClick={(event) => handleOpenConfirm('delete', event)}
                     disabled={isActionLoading}
                  >
                     {t("tenders.manage.delete")}
                  </Button>
               )}
            </div>

            {isEditing && (
               <div
                  style={{
                     display: 'flex',
                     gap: 8,
                     flexWrap: 'wrap',
                  }}
               >
                  <Button
                     variant='contained'
                     onClick={onSave}
                     disabled={isSaving}
                  >
                     {isSaving ? t("common.actions.saving") : t("common.actions.save")}
                  </Button>
               </div>
            )}
         </DialogActions>
         <AppDialog open={Boolean(confirmAction)} onClose={handleCloseConfirm}>
            <DialogTitle>{confirmConfig?.title}</DialogTitle>

            <DialogContent>
               <DialogContentText>{confirmConfig?.text}</DialogContentText>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
               <Button onClick={handleCloseConfirm} disabled={isActionLoading}>
                  {t("common.actions.cancel")}
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
         </AppDialog>
      </>
   );
}

TenderDetailsActions.propTypes = {
   tender: tenderPropType,
   isEditing: PropTypes.bool.isRequired,
   isSaving: PropTypes.bool,
   isActionLoading: PropTypes.bool,
   onSave: PropTypes.func.isRequired,
   onStartTender: PropTypes.func,
   onCancelTender: PropTypes.func,
   onDeleteTender: PropTypes.func,
};

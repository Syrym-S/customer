import { useState } from 'react';
import {
   Alert,
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogContentText,
   TextField,
   DialogTitle,
   Typography,
} from '@mui/material';
import PropTypes from 'prop-types';

import { getLeadShareLinkApi } from '../../api/leads.api';

// Mirrors this codebase's existing date-display convention (see
// formatDate/formatNotificationDate/formatDateTime in the other widgets):
// numeric DD.MM.YYYY via toLocaleString('ru-RU', ...), duplicated locally
// rather than pulled from a shared helper, matching the established pattern.
function formatShareExpiryDate(date) {
   if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      return '';
   }

   return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
   });
}

// Same "space" -> "T" normalization used elsewhere in this codebase for
// backend timestamps (see e.g. factorings.helpers.js's formatDate).
function parseApiDate(value) {
   if (!value) {
      return null;
   }

   const normalized =
      typeof value === 'string' ? value.replace(' ', 'T') : value;

   const date = new Date(normalized);

   return Number.isNaN(date.getTime()) ? null : date;
}

export function LeadShareButton({ leadId }) {
   const [isConfirmOpen, setIsConfirmOpen] = useState(false);
   const [isSharing, setIsSharing] = useState(false);
   const [shareError, setShareError] = useState('');
   const [shareLink, setShareLink] = useState('');
   const [shareExpiresAt, setShareExpiresAt] = useState(null);
   const [isCopied, setIsCopied] = useState(false);

   function handleOpenConfirm(event) {
      event?.currentTarget?.blur?.();
      setShareError('');
      setIsConfirmOpen(true);
   }

   function handleCloseConfirm() {
      if (isSharing) {
         return;
      }

      setIsConfirmOpen(false);
   }

   function handleCloseLinkDialog() {
      setShareLink('');
      setShareExpiresAt(null);
      setIsCopied(false);
   }

   async function handleConfirmShare() {
      setIsSharing(true);
      setShareError('');

      try {
         const data = await getLeadShareLinkApi(leadId);

         setShareLink(data?.url || '');
         setShareExpiresAt(parseApiDate(data?.expires_at));
         setIsConfirmOpen(false);
      } catch (error) {
         setShareError(
            error.response?.data?.message ||
               error.message ||
               'Не удалось получить ссылку. Попробуйте позже.',
         );
      } finally {
         setIsSharing(false);
      }
   }

   async function handleCopyLink() {
      if (!shareLink) {
         return;
      }

      await navigator.clipboard.writeText(shareLink);
      setIsCopied(true);

      window.setTimeout(() => {
         setIsCopied(false);
      }, 1500);
   }

   function handleOpenLink() {
      if (!shareLink) {
         return;
      }

      window.open(shareLink, '_blank', 'noopener,noreferrer');
   }

   return (
      <>
         <Button variant="outlined" onClick={handleOpenConfirm}>
            Поделиться
         </Button>

         <Dialog open={isConfirmOpen} onClose={handleCloseConfirm}>
            <DialogTitle>Поделиться лидом</DialogTitle>

            <DialogContent>
               <DialogContentText>
                  Вы уверены, что хотите поделиться информацией о лиде с
                  третьими лицами? Информация будет доступна по ссылке любому,
                  у кого она есть.
               </DialogContentText>

               {shareError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                     {shareError}
                  </Alert>
               )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
               <Button onClick={handleCloseConfirm} disabled={isSharing}>
                  Отмена
               </Button>

               <Button
                  variant="contained"
                  onClick={handleConfirmShare}
                  disabled={isSharing}
               >
                  {isSharing ? 'Создание ссылки...' : 'Поделиться'}
               </Button>
            </DialogActions>
         </Dialog>

         <Dialog
            open={Boolean(shareLink)}
            onClose={handleCloseLinkDialog}
            fullWidth
            maxWidth="sm"
         >
            <DialogTitle>Ссылка на лид</DialogTitle>

            <DialogContent>
               <DialogContentText sx={{ mb: 2 }}>
                  Любой, у кого есть эта ссылка, сможет просмотреть информацию
                  о лиде.
               </DialogContentText>

               <TextField value={shareLink} fullWidth size="small" disabled />

               {shareExpiresAt && (
                  <Typography
                     variant="body2"
                     color="text.secondary"
                     sx={{ mt: 1.5 }}
                  >
                     Ссылка действительна до{' '}
                     {formatShareExpiryDate(shareExpiresAt)}
                  </Typography>
               )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
               <Button onClick={handleCloseLinkDialog}>Закрыть</Button>

               <Button variant="outlined" onClick={handleCopyLink}>
                  {isCopied ? 'Скопировано' : 'Скопировать'}
               </Button>

               <Button variant="contained" onClick={handleOpenLink}>
                  Перейти
               </Button>
            </DialogActions>
         </Dialog>
      </>
   );
}

LeadShareButton.propTypes = {
   leadId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
};

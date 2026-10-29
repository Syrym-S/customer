import { useState } from 'react';
import { useTranslation } from "react-i18next";
import {
   Alert,
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogContentText,
   IconButton,
   TextField,
   DialogTitle,
   Tooltip,
   Typography,
} from '@mui/material';
import IosShareRoundedIcon from '@mui/icons-material/IosShareRounded';
import PropTypes from 'prop-types';

import { getLeadShareLinkApi } from '../../api/leads.api';
import { notifyError } from '../../../../shared/model/notifications.store';

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
   const { t } = useTranslation();

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
         const message =
            error.response?.data?.message ||
            error.message ||
            t("leads.share.failed");

         setShareError(message);
         notifyError(message);
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
         <Tooltip title={t("common.actions.share")}>
            <IconButton
               color="primary"
               aria-label={t("common.actions.share")}
               onClick={handleOpenConfirm}
            >
               <IosShareRoundedIcon fontSize="small" />
            </IconButton>
         </Tooltip>

         <Dialog open={isConfirmOpen} onClose={handleCloseConfirm}>
            <DialogTitle>{t("leads.share.title")}</DialogTitle>

            <DialogContent>
               <DialogContentText>
                  {t("leads.share.confirm")}
               </DialogContentText>

               {shareError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                     {shareError}
                  </Alert>
               )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
               <Button onClick={handleCloseConfirm} disabled={isSharing}>
                  {t("common.actions.cancel")}
               </Button>

               <Button
                  variant="contained"
                  onClick={handleConfirmShare}
                  disabled={isSharing}
               >
                  {isSharing ? t("leads.share.creating") : t("common.actions.share")}
               </Button>
            </DialogActions>
         </Dialog>

         <Dialog
            open={Boolean(shareLink)}
            onClose={handleCloseLinkDialog}
            fullWidth
            maxWidth="sm"
         >
            <DialogTitle>{t("leads.share.link")}</DialogTitle>

            <DialogContent>
               <DialogContentText sx={{ mb: 2 }}>
                  {t("leads.share.hint")}
               </DialogContentText>

               <TextField value={shareLink} fullWidth size="small" disabled />

               {shareExpiresAt && (
                  <Typography
                     variant="body2"
                     color="text.secondary"
                     sx={{ mt: 1.5 }}
                  >
                     {t("leads.share.validUntil")}{' '}
                     {formatShareExpiryDate(shareExpiresAt)}
                  </Typography>
               )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
               <Button onClick={handleCloseLinkDialog}>{t("common.actions.close")}</Button>

               <Button variant="outlined" onClick={handleCopyLink}>
                  {isCopied ? t("common.actions.copied") : t("common.actions.copy")}
               </Button>

               <Button variant="contained" onClick={handleOpenLink}>
                  {t("common.actions.goTo")}
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

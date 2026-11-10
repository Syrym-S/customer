import { useState } from 'react';
import { useTranslation } from "react-i18next";
import PropTypes from 'prop-types';
import {
   Alert,
   Button,
   DialogActions,
   DialogContent,
   DialogTitle,
   Stack,
   TextField,
   Typography,
} from '@mui/material';

import { createComplaint } from '../api/complaints.api';
import { useComplaintsContext } from '../model/useComplaintsContext';
import {
   COMPLAINT_REQUEST_MAX_LENGTH,
   validateComplaintAttachments,
} from '../model/complaints.helpers';
import { ComplaintTargetPicker } from './ComplaintTargetPicker';
import { ComplaintAttachmentsField } from './ComplaintAttachmentsField';
import { AppDialog } from '../../../shared/ui/AppDialog';

function createInitialState() {
   return {
      request: '',
      target: null,
      attachments: [],
   };
}

export function ComplaintForm({ open, onClose }) {
   const { t } = useTranslation();

   const { reloadComplaints } = useComplaintsContext();

   const [form, setForm] = useState(createInitialState);
   const [submitError, setSubmitError] = useState('');
   const [isSubmitting, setIsSubmitting] = useState(false);

   function handleClose() {
      setForm(createInitialState());
      setSubmitError('');
      onClose();
   }

   function validateForm() {
      const trimmedRequest = form.request.trim();

      if (!trimmedRequest) {
         return t("complaints.create.subjectPlaceholder");
      }

      if (trimmedRequest.length > COMPLAINT_REQUEST_MAX_LENGTH) {
         return t("complaints.create.maxLength", { count: COMPLAINT_REQUEST_MAX_LENGTH });
      }

      const filesError = validateComplaintAttachments(
         form.attachments.map((attachment) => attachment.file),
      );

      if (filesError) {
         return filesError;
      }

      return '';
   }

   async function handleSubmit(event) {
      event.preventDefault();

      const validationError = validateForm();

      if (validationError) {
         setSubmitError(validationError);
         return;
      }

      try {
         setIsSubmitting(true);
         setSubmitError('');

         await createComplaint({
            request: form.request.trim(),
            target: form.target,
            files: form.attachments.map((attachment) => attachment.file),
         });

         await reloadComplaints();
         handleClose();
      } catch (error) {
         setSubmitError(
            error.response?.data?.message ||
               error.message ||
               t("complaints.create.failed"),
         );
      } finally {
         setIsSubmitting(false);
      }
   }

   return (
      <AppDialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
         <DialogTitle>{t("complaints.create.action")}</DialogTitle>

         <DialogContent>
            <Stack component="form" onSubmit={handleSubmit} spacing={2.5} sx={{ pt: 1 }}>
               {submitError && <Alert severity="error">{submitError}</Alert>}

               <ComplaintTargetPicker
                  value={form.target}
                  onChange={(target) => setForm((prev) => ({ ...prev, target }))}
               />

               <TextField
                  label={t("complaints.create.subject")}
                  placeholder={t("complaints.create.describePlaceholder")}
                  multiline
                  minRows={4}
                  fullWidth
                  value={form.request}
                  onChange={(event) =>
                     setForm((prev) => ({ ...prev, request: event.target.value }))
                  }
                  slotProps={{
                     htmlInput: { maxLength: COMPLAINT_REQUEST_MAX_LENGTH },
                  }}
               />

               <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: 'right', mt: -1.5 }}
               >
                  {form.request.length} / {COMPLAINT_REQUEST_MAX_LENGTH}
               </Typography>

               <ComplaintAttachmentsField
                  attachments={form.attachments}
                  onChange={(attachments) =>
                     setForm((prev) => ({ ...prev, attachments }))
                  }
               />
            </Stack>
         </DialogContent>

         <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleClose} disabled={isSubmitting}>
               {t("common.actions.cancel")}
            </Button>

            <Button
               variant="contained"
               onClick={handleSubmit}
               disabled={isSubmitting}
            >
               {isSubmitting ? t("common.actions.sendingShort") : t("complaints.create.submit")}
            </Button>
         </DialogActions>
      </AppDialog>
   );
}

ComplaintForm.propTypes = {
   open: PropTypes.bool.isRequired,
   onClose: PropTypes.func.isRequired,
};

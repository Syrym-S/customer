import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import {
   Alert,
   Box,
   Button,
   DialogActions,
   DialogContent,
   DialogTitle,
   Stack,
   Typography,
} from '@mui/material';
import PlaylistAddCheckRoundedIcon from '@mui/icons-material/PlaylistAddCheckRounded';
import AddRoadRoundedIcon from '@mui/icons-material/AddRoadRounded';

import { AppDialog } from '../../../shared/ui/AppDialog';
import { DialogCloseButton } from '../../../shared/ui/DialogCloseButton';
import { CreateLeadModal } from '../../../features/create-lead/ui/CreateLeadModal';
import { createAdvertisement } from '../api/advertisements.repository';
import { mapCreatedLeadToAdvertisementLead } from '../model/advertisement.adapter';
import { useAdvertisementsContext } from '../model/useAdvertisementsContext';
import { AdvertisementLeadPicker } from './AdvertisementLeadPicker';

const MODAL_STEPS = {
   CHOICE: 'choice',
   EXISTING: 'existing',
};

const CREATE_LEAD_HIDDEN_STEPS = ['forwarder'];

function ChoiceButton({ icon, title, description, onClick }) {
   return (
      <Box
         onClick={onClick}
         role="button"
         tabIndex={0}
         sx={{
            p: 2.5,
            display: 'flex',
            gap: 2,
            alignItems: 'flex-start',
            border: '2px solid',
            borderColor: 'divider',
            borderRadius: 3,
            cursor: 'pointer',
            transition: '0.2s ease',
            '&:hover': {
               borderColor: 'primary.light',
               backgroundColor: 'action.hover',
            },
         }}
      >
         <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>

         <Box>
            <Typography sx={{ fontWeight: 600 }}>{title}</Typography>

            <Typography variant="body2" color="text.secondary">
               {description}
            </Typography>
         </Box>
      </Box>
   );
}

ChoiceButton.propTypes = {
   icon: PropTypes.node.isRequired,
   title: PropTypes.string.isRequired,
   description: PropTypes.string.isRequired,
   onClick: PropTypes.func.isRequired,
};

export function CreateAdvertisementModal({ open, onClose }) {
   const { t } = useTranslation();

   const { reloadAdvertisements, setPage } = useAdvertisementsContext();

   const [step, setStep] = useState(MODAL_STEPS.CHOICE);
   const [selectedLead, setSelectedLead] = useState(null);
   const [isCreateLeadOpen, setIsCreateLeadOpen] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [submitError, setSubmitError] = useState('');

   function resetState() {
      setStep(MODAL_STEPS.CHOICE);
      setSelectedLead(null);
      setIsSubmitting(false);
      setSubmitError('');
   }

   function handleClose() {
      resetState();
      onClose();
   }

   function handleOpenCreateLead() {
      setIsCreateLeadOpen(true);
      handleClose();
   }

   async function refreshAdvertisements() {
      setPage(1);
      await reloadAdvertisements({ withLoader: false });
   }

   async function handleSubmitExistingLead() {
      if (!selectedLead || isSubmitting) {
         return;
      }

      try {
         setIsSubmitting(true);
         setSubmitError('');

         await createAdvertisement({ leadId: selectedLead.id, lead: selectedLead });
         await refreshAdvertisements();

         handleClose();
      } catch (error) {
         setSubmitError(error.message || t('advertisements.create.failed'));
      } finally {
         setIsSubmitting(false);
      }
   }

   async function handleLeadCreated(createdLead) {
      try {
         const lead = mapCreatedLeadToAdvertisementLead(createdLead);

         await createAdvertisement({ leadId: lead?.id, lead });
      } finally {
         await refreshAdvertisements();
      }
   }

   return (
      <>
         <AppDialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ pt: 3, pr: 7, fontSize: 20, fontWeight: 600 }}>
               {t('advertisements.create.title')}
            </DialogTitle>

            <DialogCloseButton onClick={handleClose} disabled={isSubmitting} />

            <DialogContent dividers>
               {step === MODAL_STEPS.CHOICE ? (
                  <Stack spacing={2}>
                     <Typography variant="body2" color="text.secondary">
                        {t('advertisements.create.subtitle')}
                     </Typography>

                     <ChoiceButton
                        icon={<PlaylistAddCheckRoundedIcon />}
                        title={t('advertisements.create.chooseExisting')}
                        description={t(
                           'advertisements.create.chooseExistingHint',
                        )}
                        onClick={() => setStep(MODAL_STEPS.EXISTING)}
                     />

                     <ChoiceButton
                        icon={<AddRoadRoundedIcon />}
                        title={t('advertisements.create.createNew')}
                        description={t('advertisements.create.createNewHint')}
                        onClick={handleOpenCreateLead}
                     />
                  </Stack>
               ) : (
                  <Stack spacing={2}>
                     {submitError && (
                        <Alert severity="error">{submitError}</Alert>
                     )}

                     <AdvertisementLeadPicker
                        selectedLead={selectedLead}
                        onSelectLead={setSelectedLead}
                     />
                  </Stack>
               )}
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
               {step === MODAL_STEPS.EXISTING && (
                  <Button
                     onClick={() => setStep(MODAL_STEPS.CHOICE)}
                     disabled={isSubmitting}
                  >
                     {t('common.actions.back')}
                  </Button>
               )}

               <Box sx={{ flex: 1 }} />

               <Button onClick={handleClose} disabled={isSubmitting}>
                  {t('common.actions.cancel')}
               </Button>

               {step === MODAL_STEPS.EXISTING && (
                  <Button
                     variant="contained"
                     onClick={handleSubmitExistingLead}
                     disabled={!selectedLead || isSubmitting}
                  >
                     {t('advertisements.create.submit')}
                  </Button>
               )}
            </DialogActions>
         </AppDialog>

         <CreateLeadModal
            open={isCreateLeadOpen}
            onClose={() => setIsCreateLeadOpen(false)}
            hiddenStepKeys={CREATE_LEAD_HIDDEN_STEPS}
            onCreated={handleLeadCreated}
         />
      </>
   );
}

CreateAdvertisementModal.propTypes = {
   open: PropTypes.bool.isRequired,
   onClose: PropTypes.func.isRequired,
};

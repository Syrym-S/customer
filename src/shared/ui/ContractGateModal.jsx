import { useState } from 'react';
import { useTranslation } from "react-i18next";
import {
   Alert,
   Button,
   CircularProgress,
   Dialog,
   DialogActions,
   DialogContent,
   Link as MuiLink,
   Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { useContractStore, attemptContractSigning } from '../model/contract.store';

const MISSING_PROFILE_FIELDS_MESSAGE_PREFIX = 'Заполните профиль';

function classifySigningError(error) {
   const status = error.response?.status;
   const message = error.response?.data?.message;

   if (status === 409) {
      return { type: 'already-signed' };
   }

   if (status === 422 && message?.startsWith(MISSING_PROFILE_FIELDS_MESSAGE_PREFIX)) {
      return { type: 'missing-profile-fields', message };
   }

   if (status === 422) {
      // "Файл договора не найден" / "Шаблон договора не настроен" — our-side
      // config issue, not something the customer can act on. Don't surface
      // the raw backend message for this branch.
      return { type: 'config-error' };
   }

   if (status === 502) {
      return { type: 'service-unavailable' };
   }

   return { type: 'unknown', message: message || error.message };
}

export function ContractGateModal() {
   const { t } = useTranslation();

   const hasValidContract = useContractStore((state) => state.hasValidContract);
   const contractGateSuspendedForProfile = useContractStore(
      (state) => state.contractGateSuspendedForProfile,
   );
   const suspendGateForProfile = useContractStore((state) => state.suspendGateForProfile);
   const isContractGateEnabled = useContractStore((state) => state.isContractGateEnabled);

   const [isSigning, setIsSigning] = useState(false);
   const [signingError, setSigningError] = useState(null);

   async function handleSignContract() {
      setIsSigning(true);
      setSigningError(null);

      try {
         const result = await attemptContractSigning();

         if (result.type === 'already-signed') {
            setIsSigning(false);
         }

         // 'redirecting' leaves isSigning true — the tab is about to navigate away.
      } catch (error) {
         const classified = classifySigningError(error);

         setSigningError(classified);
         setIsSigning(false);
      }
   }

   const isBlocked =
      isContractGateEnabled && hasValidContract === false && !contractGateSuspendedForProfile;

   return (
      <Dialog
         open={isBlocked}
         disableEscapeKeyDown
         hideBackdrop={false}
         onClose={() => {}}
      >
         <DialogContent>
            <Typography>
               {t("contractGate.noContracts")}
            </Typography>

            {signingError?.type === 'missing-profile-fields' && (
               <Alert severity="warning" sx={{ mt: 2 }}>
                  {signingError.message}
                  {' '}
                  <MuiLink
                     component={RouterLink}
                     to="/customer/profile"
                     onClick={suspendGateForProfile}
                  >
                     {t("contractGate.goToProfile")}
                  </MuiLink>
               </Alert>
            )}

            {signingError?.type === 'config-error' && (
               <Alert severity="error" sx={{ mt: 2 }}>
                  {t("errors.genericSupport")}
               </Alert>
            )}

            {signingError?.type === 'service-unavailable' && (
               <Alert severity="error" sx={{ mt: 2 }}>
                  {t("common.signing.unavailable")}
               </Alert>
            )}

            {signingError?.type === 'unknown' && (
               <Alert severity="error" sx={{ mt: 2 }}>
                  {signingError.message}
               </Alert>
            )}
         </DialogContent>

         <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
               variant="contained"
               onClick={handleSignContract}
               disabled={isSigning}
               startIcon={isSigning ? <CircularProgress size={16} /> : null}
            >
               {isSigning
                  ? t("common.signing.opening")
                  : signingError
                     ? t("common.actions.retryAttempt")
                     : t("contractGate.signContract")}
            </Button>
         </DialogActions>
      </Dialog>
   );
}

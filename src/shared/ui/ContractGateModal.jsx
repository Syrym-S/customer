import { useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, Typography } from '@mui/material';

import { useContractStore } from '../model/contract.store';

// TODO(placeholder): replace with the real aitu passport contract-signing URL once known.
const AITU_PASSPORT_SIGN_CONTRACT_URL = 'https://passport.aitu.io/sign-contract';

const CONTRACT_POLL_INTERVAL_MS = 15 * 60 * 1000;

export function ContractGateModal() {
   const hasValidContract = useContractStore((state) => state.hasValidContract);
   const checkContract = useContractStore((state) => state.checkContract);

   useEffect(() => {
      // TODO(backend): aitu passport doesn't support a real redirect-back yet.
      // Once it does, it should append a URL param (e.g. ?contract_redirect=1)
      // to the return URL — check for it here and, if present, trigger an
      // immediate checkContract() (instead of waiting for the next poll) and
      // strip the param from the URL.
      checkContract();

      const intervalId = setInterval(checkContract, CONTRACT_POLL_INTERVAL_MS);

      return () => clearInterval(intervalId);
   }, [checkContract]);

   const isBlocked = hasValidContract === false;

   return (
      <Dialog
         open={isBlocked}
         disableEscapeKeyDown
         hideBackdrop={false}
         onClose={() => {}}
      >
         <DialogContent>
            <Typography>
               У вас нет договоров или срок подписания истек
            </Typography>
         </DialogContent>

         <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
               variant="contained"
               href={AITU_PASSPORT_SIGN_CONTRACT_URL}
               target="_blank"
               rel="noopener noreferrer"
            >
               Подписать договор
            </Button>
         </DialogActions>
      </Dialog>
   );
}

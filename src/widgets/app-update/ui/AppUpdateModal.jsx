import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogContentText,
   DialogTitle,
} from '@mui/material';

import { useAppVersionCheck } from '../model/useAppVersionCheck';
import { openStoreLink } from '../model/open-store-link';

export function AppUpdateModal() {
   const { t } = useTranslation();

   const { updateInfo } = useAppVersionCheck();
   const [isDismissed, setIsDismissed] = useState(false);

   if (!updateInfo || isDismissed) {
      return null;
   }

   const isForced = updateInfo.isForced;

   async function handleUpdate() {
      await openStoreLink(updateInfo.updateUrl);
   }

   return (
      <Dialog
         open
         onClose={isForced ? undefined : () => setIsDismissed(true)}
         disableEscapeKeyDown={isForced}
      >
         <DialogTitle>
            {updateInfo.shortDescription || t('appUpdate.title')}
         </DialogTitle>

         <DialogContent>
            <DialogContentText sx={{ whiteSpace: 'pre-line' }}>
               {updateInfo.description ||
                  t('appUpdate.available', { version: updateInfo.latestVersion })}
               {isForced && t('appUpdate.mandatory')}
            </DialogContentText>
         </DialogContent>

         <DialogActions>
            {!isForced && (
               <Button onClick={() => setIsDismissed(true)}>
                  {t('common.actions.later')}
               </Button>
            )}

            <Button variant="contained" onClick={handleUpdate}>
               {t('common.actions.update')}
            </Button>
         </DialogActions>
      </Dialog>
   );
}

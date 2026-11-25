import { AppLauncher } from '@capacitor/app-launcher';

import { isNative } from '../../../shared/config/platform';

export async function openStoreLink(url) {
   const target = String(url || '').trim();

   if (!target) {
      return false;
   }

   if (!isNative) {
      window.open(target, '_blank', 'noopener,noreferrer');

      return true;
   }

   const launched = await AppLauncher.openUrl({ url: target })
      .then((result) => Boolean(result?.completed))
      .catch(() => false);

   if (launched) {
      return true;
   }

   window.open(target, '_system');

   return true;
}

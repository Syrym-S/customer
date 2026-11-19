import { Browser } from '@capacitor/browser';

import { isNative } from '../config/platform';
import { addPluginListener } from './capacitor-plugin';

function openInNewTab(url) {
   window.open(url, '_blank', 'noopener,noreferrer');
}

function waitForBrowserClose() {
   return new Promise((resolve) => {
      let remove = null;

      remove = addPluginListener(Browser, 'browserFinished', () => {
         remove?.();
         resolve(true);
      });
   });
}

export async function openExternalLink(url) {
   const target = String(url || '').trim();

   if (!target) {
      return false;
   }

   if (!isNative) {
      openInNewTab(target);

      return false;
   }

   const closed = waitForBrowserClose();

   await Browser.open({ url: target });

   return closed;
}

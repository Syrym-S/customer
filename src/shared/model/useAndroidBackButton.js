import { useEffect } from 'react';
import { App } from '@capacitor/app';

import { isNative } from '../config/platform';
import { addPluginListener } from '../lib/capacitor-plugin';
import { runTopBackHandler } from './back-handlers';

export function useAndroidBackButton() {
   useEffect(() => {
      if (!isNative) {
         return undefined;
      }

      return addPluginListener(App, 'backButton', (event) => {
         if (runTopBackHandler()) {
            return;
         }

         if (event?.canGoBack) {
            window.history.back();

            return;
         }

         App.exitApp();
      });
   }, []);
}

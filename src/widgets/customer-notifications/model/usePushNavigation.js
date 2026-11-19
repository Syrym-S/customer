import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { appBasename } from '../../../shared/api/api-client';
import { isNative } from '../../../shared/config/platform';
import { PushNotifications } from '@capacitor/push-notifications';

import { addPluginListener } from '../../../shared/lib/capacitor-plugin';
import { getAppOrigin } from '../../../shared/lib/app-origin';
import { notifyRealtimeNotification } from '../../../shared/model/notifications.store';
import { extractNotificationFromPayload } from '../lib/notification-payload';
import { resolveCustomerNotificationAppPath } from './notifications.helpers';

const PUSH_NAVIGATE_MESSAGE = 'push-navigate';

const CUSTOMER_PATH_PREFIX = '/customer';

function toAppPath(rawUrl) {
   if (!rawUrl) {
      return '';
   }

   try {
      const appOrigin = getAppOrigin();
      const url = new URL(String(rawUrl).replaceAll('\\/', '/'), appOrigin);

      if (url.origin !== appOrigin) {
         return '';
      }

      const basename = appBasename === '/' ? '' : appBasename;
      const pathname = url.pathname.startsWith(basename)
         ? url.pathname.slice(basename.length)
         : url.pathname;

      const appPath =
         resolveCustomerNotificationAppPath(pathname) ||
         (pathname.startsWith(CUSTOMER_PATH_PREFIX) ? pathname : '');

      if (!appPath) {
         return '';
      }

      return `${appPath}${url.search}${url.hash}`;
   } catch {
      return '';
   }
}

function readPushData(notification) {
   return notification?.data || notification?.notification?.data || {};
}

export function usePushNavigation() {
   const navigate = useNavigate();

   useEffect(() => {
      if (!isNative) {
         return undefined;
      }

      const removeAction = addPluginListener(
         PushNotifications,
         'pushNotificationActionPerformed',
         (event) => {
            const data = readPushData(event?.notification);
            const appPath = toAppPath(data.link || data.url);

            if (appPath) {
               navigate(appPath);
            }
         },
      );

      const removeReceived = addPluginListener(
         PushNotifications,
         'pushNotificationReceived',
         (event) => {
            const payload = {
               ...readPushData(event),
               theme: event?.title || readPushData(event).theme,
               message: event?.body || readPushData(event).message,
            };

            const notification = extractNotificationFromPayload(payload);

            if (notification) {
               notifyRealtimeNotification(notification);
            }
         },
      );

      return () => {
         removeAction();
         removeReceived();
      };
   }, [navigate]);

   useEffect(() => {
      if (isNative || !('serviceWorker' in navigator)) {
         return undefined;
      }

      function handleMessage(event) {
         if (event.data?.type !== PUSH_NAVIGATE_MESSAGE || !event.data.url) {
            return;
         }

         const appPath = toAppPath(event.data.url);

         if (appPath) {
            navigate(appPath);
         }
      }

      navigator.serviceWorker.addEventListener('message', handleMessage);

      return () => {
         navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
   }, [navigate]);
}

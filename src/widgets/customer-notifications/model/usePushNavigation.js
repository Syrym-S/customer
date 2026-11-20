import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { isNative } from '../../../shared/config/platform';
import { PushNotifications } from '@capacitor/push-notifications';

import { addPluginListener } from '../../../shared/lib/capacitor-plugin';
import { notifyRealtimeNotification } from '../../../shared/model/notifications.store';
import {
   NOTIFICATION_LINK_IN_APP,
   resolveNotificationLinkTarget,
} from '../lib/notification-link';
import { extractNotificationFromPayload } from '../lib/notification-payload';

const PUSH_NAVIGATE_MESSAGE = 'push-navigate';

function toAppPath(rawUrl) {
   const target = resolveNotificationLinkTarget(rawUrl);

   return target.kind === NOTIFICATION_LINK_IN_APP ? target.path : '';
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

import { useEffect } from 'react';

import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';

import i18n from '../../../shared/i18n';
import { getPlatform, isNative } from '../../../shared/config/platform';
import { addPluginListener } from '../../../shared/lib/capacitor-plugin';
import { publishNotificationDomainEvent } from '../../../shared/model/notification-domain-events';
import { PUSH_CHANNEL_ID } from '../../../services/firebase';
import {
   getNotificationMessageText,
   getNotificationThemeText,
} from '../lib/notification-texts';
import { requestNotificationLinkNavigation } from './notification-navigation';

const PUSH_NAVIGATE_MESSAGE = 'push-navigate';
const FOREGROUND_NOTIFICATION_SMALL_ICON = 'ic_stat_notification';

let foregroundNotificationId = 0;

function readPushData(notification) {
   return notification?.data || notification?.notification?.data || {};
}

function readPushLink(data) {
   return data.link || data.url || '';
}

async function showForegroundNotification(event) {
   if (getPlatform() !== 'android') {
      return;
   }

   const data = readPushData(event);

   const title = event?.title || data.title || data.theme || '';
   const body = event?.body || data.body || data.message || '';

   if (!title && !body) {
      return;
   }

   const translatable = {
      theme: title,
      message: body,
      type: data.type || '',
   };

   foregroundNotificationId += 1;

   try {
      await LocalNotifications.schedule({
         notifications: [
            {
               id: foregroundNotificationId,
               title:
                  getNotificationThemeText(translatable) ||
                  i18n.t('notifications.newToast'),
               body: getNotificationMessageText(translatable),
               channelId: PUSH_CHANNEL_ID,
               smallIcon: FOREGROUND_NOTIFICATION_SMALL_ICON,
               extra: { link: readPushLink(data) },
            },
         ],
      });
   } catch (error) {
      console.error('Push failed to show foreground notification', error);
   }
}

export function usePushNavigation() {
   useEffect(() => {
      if (!isNative) {
         return undefined;
      }

      const removeAction = addPluginListener(
         PushNotifications,
         'pushNotificationActionPerformed',
         (event) => {
            requestNotificationLinkNavigation(
               readPushLink(readPushData(event?.notification)),
            );
         },
      );

      const removeReceived = addPluginListener(
         PushNotifications,
         'pushNotificationReceived',
         (event) => {
            publishNotificationDomainEvent({
               type: readPushData(event).type,
            });

            showForegroundNotification(event);
         },
      );

      const removeLocalAction = addPluginListener(
         LocalNotifications,
         'localNotificationActionPerformed',
         (action) => {
            requestNotificationLinkNavigation(
               action?.notification?.extra?.link || '',
            );
         },
      );

      return () => {
         removeAction();
         removeReceived();
         removeLocalAction();
      };
   }, []);

   useEffect(() => {
      if (isNative || !('serviceWorker' in navigator)) {
         return undefined;
      }

      function handleMessage(event) {
         if (event.data?.type !== PUSH_NAVIGATE_MESSAGE || !event.data.url) {
            return;
         }

         requestNotificationLinkNavigation(event.data.url);
      }

      navigator.serviceWorker.addEventListener('message', handleMessage);

      return () => {
         navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
   }, []);
}

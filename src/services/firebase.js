import { initializeApp } from 'firebase/app';
import {
   deleteToken,
   getMessaging,
   getToken,
   isSupported,
} from 'firebase/messaging';

import { appBasename } from '../shared/api/api-client';
import { getPlatform, isNative } from '../shared/config/platform';
import { PushNotifications } from '@capacitor/push-notifications';

import { addPluginListener } from '../shared/lib/capacitor-plugin';

// Те же значения, что в public/firebase-messaging-sw.js: воркер не может
// читать их отсюда, поэтому конфиг продублирован. Менять вместе.
const app = initializeApp({
   apiKey: 'AIzaSyBOstfMi_fwSXZ7f5ULud-QY2hKBh9j54A',
   projectId: 'logistics-d2ca7',
   messagingSenderId: '102491456805',
   appId: '1:102491456805:web:ddd19352a0949d106586cc',
});

// Публичная половина пары, приватная лежит у Firebase — в бандле это не секрет.
// Не перегенерировать: все выданные токены разом станут недействительными.
const VAPID_KEY =
   'BMLmHZeZgTgmG1QoPe0xnvQXPwwJ43fRfhD41Gpz4kjMqNWA6m8ssi6u5TgrE6MFQe1sswhE-yMjsvqT--ucYEs';

// У каждого контура свой воркер: иначе прод и staging в одном браузере делят
// одну регистрацию, а с ней и один FCM-токен.
const SERVICE_WORKER_SCOPE = appBasename === '/' ? '/' : `${appBasename}/`;
const SERVICE_WORKER_URL = `${SERVICE_WORKER_SCOPE}firebase-messaging-sw.js`;

const NATIVE_TOKEN_TIMEOUT_MS = 15000;

const NOTIFICATION_CHANNEL = {
   id: 'customer-notifications',
   name: 'Уведомления',
   importance: 5,
   visibility: 1,
   vibration: true,
};

async function createNotificationChannel() {
   if (getPlatform() !== 'android') {
      return;
   }

   try {
      await PushNotifications.createChannel(NOTIFICATION_CHANNEL);
   } catch {
      return;
   }
}

function normalizeNativePermission(status) {
   if (status === 'granted' || status === 'denied') {
      return status;
   }

   return 'default';
}

async function getNativePermission() {
   try {
      const result = await PushNotifications.checkPermissions();

      return normalizeNativePermission(result?.receive);
   } catch {
      return 'denied';
   }
}

function registerNativeToken() {
   return new Promise((resolve) => {
      let removeRegistration = null;
      let removeError = null;
      let timeoutId = null;
      let isSettled = false;

      function settle(token) {
         if (isSettled) {
            return;
         }

         isSettled = true;

         window.clearTimeout(timeoutId);
         removeRegistration?.();
         removeError?.();

         resolve(token);
      }

      removeRegistration = addPluginListener(
         PushNotifications,
         'registration',
         (event) => {
            settle(event?.value || null);
         },
      );

      removeError = addPluginListener(
         PushNotifications,
         'registrationError',
         () => settle(null),
      );

      timeoutId = window.setTimeout(() => settle(null), NATIVE_TOKEN_TIMEOUT_MS);

      createNotificationChannel()
         .then(() => PushNotifications.register())
         .catch(() => settle(null));
   });
}

export async function isWebPushSupported() {
   if (isNative) {
      return true;
   }

   return (
      'serviceWorker' in navigator &&
      'Notification' in window &&
      (await isSupported())
   );
}

export function getWebPushPermission() {
   if (isNative) {
      return 'default';
   }

   return 'Notification' in window ? Notification.permission : 'denied';
}

export async function getPushPermission() {
   if (isNative) {
      return getNativePermission();
   }

   return getWebPushPermission();
}

// Для галочки в настройках: показывает системный запрос разрешения. Вызывать
// только по клику пользователя — отказ необратим, второй раз браузер не спросит.
export async function requestWebPushToken() {
   if (!(await isWebPushSupported())) {
      return null;
   }

   if (isNative) {
      const result = await PushNotifications.requestPermissions();

      if (normalizeNativePermission(result?.receive) !== 'granted') {
         return null;
      }

      return registerNativeToken();
   }

   const permission = await Notification.requestPermission();

   if (permission !== 'granted') {
      return null;
   }

   return retrieveToken();
}

// Для старта приложения: молча переполучает токен, если разрешение уже выдано.
// Токен может смениться сам (очистка данных сайта, ротация подписки), поэтому
// его проверяют на каждом запуске и перезаписывают на бэке.
export async function refreshWebPushToken() {
   if ((await getPushPermission()) !== 'granted') {
      return null;
   }

   if (!(await isWebPushSupported())) {
      return null;
   }

   if (isNative) {
      return registerNativeToken();
   }

   return retrieveToken();
}

export async function deleteWebPushToken() {
   if (!(await isWebPushSupported())) {
      return;
   }

   if (isNative) {
      try {
         await PushNotifications.unregister();
      } catch {
         return;
      }

      return;
   }

   await deleteToken(getMessaging(app));
}

async function retrieveToken() {
   const registration = await navigator.serviceWorker.register(
      SERVICE_WORKER_URL,
      { scope: SERVICE_WORKER_SCOPE },
   );

   return getToken(getMessaging(app), {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
   });
}

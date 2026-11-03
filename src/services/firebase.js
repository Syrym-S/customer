import { initializeApp } from 'firebase/app';
import {
   deleteToken,
   getMessaging,
   getToken,
   isSupported,
} from 'firebase/messaging';

import { appBasename } from '../shared/api/api-client';

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

export async function isWebPushSupported() {
   return (
      'serviceWorker' in navigator &&
      'Notification' in window &&
      (await isSupported())
   );
}

export function getWebPushPermission() {
   return 'Notification' in window ? Notification.permission : 'denied';
}

// Для галочки в настройках: показывает системный запрос разрешения. Вызывать
// только по клику пользователя — отказ необратим, второй раз браузер не спросит.
export async function requestWebPushToken() {
   if (!(await isWebPushSupported())) {
      return null;
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
   if (getWebPushPermission() !== 'granted') {
      return null;
   }

   if (!(await isWebPushSupported())) {
      return null;
   }

   return retrieveToken();
}

export async function deleteWebPushToken() {
   if (!(await isWebPushSupported())) {
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

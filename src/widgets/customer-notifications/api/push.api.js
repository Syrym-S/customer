import axios from 'axios';
import { CapacitorHttp } from '@capacitor/core';

import { fetchNotificationWsTokenApi } from './notifications-ws.api';
import { getCurrentLanguage } from '../../../shared/i18n';
import { getPlatform, isNative } from '../../../shared/config/platform';
import { getNotificationRealtimeConfig } from '../lib/notification-realtime-config';

const PUSH_REQUEST_TIMEOUT_MS = 15000;

// Сервис уведомлений живёт на своём хосте и не знает про WP-сессию, поэтому
// запросы идут мимо apiClient: вместо nonce и cookie — Bearer-токен, который
// выдаёт WP по /notif/v1/token (тот же, что авторизует сокет).
async function fetchNotifToken() {
   const response = await fetchNotificationWsTokenApi();

   const token =
      response?.token || response?.data?.token || response?.access_token || '';

   if (!token) {
      throw new Error('Notification service token was not returned');
   }

   return token;
}

function buildHeaders(notifToken) {
   return {
      'Content-Type': 'application/json',
      'Accept-Language': getCurrentLanguage(),
      Authorization: `Bearer ${notifToken}`,
   };
}

// CapacitorHttp идёт через нативный слой: у хоста уведомлений нет CORS-заголовков
// для origin вебвью (https://localhost), и обычный XHR блокируется на preflight.
async function sendNativeRequest({ url, method, data, notifToken }) {
   const response = await CapacitorHttp.request({
      url,
      method,
      headers: buildHeaders(notifToken),
      data,
      connectTimeout: PUSH_REQUEST_TIMEOUT_MS,
      readTimeout: PUSH_REQUEST_TIMEOUT_MS,
   });

   // CapacitorHttp не бросает на 4xx/5xx — приводим к форме axios-ошибки,
   // чтобы вызывающий код различал 401 так же, как у остальных запросов.
   if (response.status < 200 || response.status >= 300) {
      const error = new Error(
         response?.data?.message ||
            `push-token request failed with status ${response.status}`,
      );

      error.response = response;

      throw error;
   }

   return response.data;
}

async function sendWebRequest({ url, method, data, notifToken }) {
   const response = await axios.request({
      url,
      method,
      headers: buildHeaders(notifToken),
      data,
      timeout: PUSH_REQUEST_TIMEOUT_MS,
   });

   return response.data;
}

function sendPushTokenRequest(options) {
   return isNative ? sendNativeRequest(options) : sendWebRequest(options);
}

async function requestWithNotifToken(method, data) {
   const { push } = getNotificationRealtimeConfig();

   const notifToken = await fetchNotifToken();

   try {
      return await sendPushTokenRequest({
         url: push,
         method,
         data,
         notifToken,
      });
   } catch (error) {
      if (error?.response?.status !== 401) {
         throw error;
      }

      return sendPushTokenRequest({
         url: push,
         method,
         data,
         notifToken: await fetchNotifToken(),
      });
   }
}

export function savePushTokenApi(pushToken) {
   const { role } = getNotificationRealtimeConfig();

   return requestWithNotifToken('POST', {
      role,
      token: pushToken,
      device: getPlatform(),
      language: getCurrentLanguage(),
   });
}

export function deletePushTokenApi(pushToken) {
   const { role } = getNotificationRealtimeConfig();

   // Токен обязателен: без него сервис отвяжет уведомления на всех устройствах
   // пользователя, а не только в этом браузере.
   return requestWithNotifToken('DELETE', {
      role,
      token: pushToken,
   });
}

import axios from 'axios';

import { fetchNotificationWsTokenApi } from './notifications-ws.api';
import { getNotificationRealtimeConfig } from '../lib/notification-realtime-config';

// Сервис уведомлений живёт на своём хосте и не знает про WP-сессию, поэтому
// запросы идут мимо apiClient: вместо nonce и cookie — Bearer-токен, который
// выдаёт WP по /notif/v1/token (тот же, что авторизует сокет).
async function buildRequestConfig() {
   const { push, role } = getNotificationRealtimeConfig();

   const response = await fetchNotificationWsTokenApi();
   const token =
      response?.token || response?.data?.token || response?.access_token || '';

   if (!token) {
      throw new Error('Notification service token was not returned');
   }

   return {
      endpoint: push,
      role,
      headers: { Authorization: `Bearer ${token}` },
   };
}

export async function savePushTokenApi(pushToken) {
   const { endpoint, role, headers } = await buildRequestConfig();

   const response = await axios.post(
      endpoint,
      { role, token: pushToken, device: 'web' },
      { headers },
   );

   return response.data;
}

export async function deletePushTokenApi(pushToken) {
   const { endpoint, role, headers } = await buildRequestConfig();

   // Токен обязателен: без него сервис отвяжет уведомления на всех устройствах
   // пользователя, а не только в этом браузере.
   const response = await axios.delete(endpoint, {
      headers,
      data: { role, token: pushToken },
   });

   return response.data;
}

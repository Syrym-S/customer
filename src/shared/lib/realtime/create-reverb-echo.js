import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const REVERB_WSS_PORT = 443;
const REVERB_FORCE_TLS = true;
const REVERB_DEFAULT_TRANSPORTS = ['ws', 'wss'];

export function createReverbEcho({
   key,
   wsHost,
   authEndpoint,
   token,
   authHeaders,
   enabledTransports = REVERB_DEFAULT_TRANSPORTS,
}) {
   if (!key) {
      throw new Error('Reverb app key is missing');
   }

   if (!wsHost) {
      throw new Error('Reverb ws host is missing');
   }

   if (!authEndpoint) {
      throw new Error('Reverb auth endpoint is missing');
   }

   return new Echo({
      broadcaster: 'reverb',
      key,
      wsHost: normalizeReverbWsHost(wsHost),
      wssPort: REVERB_WSS_PORT,
      forceTLS: REVERB_FORCE_TLS,
      enabledTransports,
      authEndpoint,
      withoutInterceptors: true,
      auth: {
         headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
            ...authHeaders,
         },
      },
   });
}

export function normalizeReverbWsHost(value) {
   const rawHost = String(value || '').trim();

   if (!rawHost) {
      return '';
   }

   const hasProtocol = /^[a-z]+:\/\//i.test(rawHost);

   try {
      return new URL(hasProtocol ? rawHost : `wss://${rawHost}`).hostname;
   } catch {
      return rawHost.replace(/^\/+/, '').split('/')[0];
   }
}

export function disconnectReverbEcho(echo, logLabel = 'Reverb') {
   if (!echo) {
      return;
   }

   try {
      echo.disconnect();
   } catch (error) {
      console.warn(`${logLabel}: error disconnecting Echo`, error);
   }
}

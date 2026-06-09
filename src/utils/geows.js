/**
 * WebSocket client for GeoWS
 *
 * Сервер ожидает query:
 *  - token (session key)
 *
 * Сообщения:
 *  - запрос точек: { type: "admin", action: "get_points" }
 *  - входящие: { type: "get_points", data: [...] }
 */

/**
 * @param {Object} params
 * @param {string} params.wsUrl - base ws url (пример: wss://logistic.prodavay.kz:8282)
 * @param {string} params.token - session key
 * @param {number|string} params.userId - wp current user id
 * @returns {WebSocket}
 */

export const GEO_WS_MESSAGE_TYPES = {
   ADMIN: 'admin',
   READ: 'read',
   ADD: 'add',
   GET_POINTS: 'get_points',
   ERROR: 'error',
};

export function connectGeoWS({ wsUrl, token }) {
   if (!wsUrl) throw new Error('WS URL not configured');
   if (!token) throw new Error('Session token missing');

   const url = new URL(wsUrl);
   url.searchParams.set('token', token);

   return new WebSocket(url.toString());
}

/**
 * Подписка на события WS
 */
export function bindGeoWS(ws, handlers = {}) {
   const { onOpen, onClose, onError, onAuthFailed, onPoints, onMessage } =
      handlers;

   ws.onopen = () => {
      onOpen?.();
      console.log('WS opened');
   };

   ws.onerror = (e) => {
      onError?.(e);
      console.log('WS error:', e);
   };

   ws.onclose = (e) => {
      onClose?.(e);
      console.log('WS closed:', e);
   };

   ws.onmessage = (event) => {
      let payload = null;

      try {
         payload = JSON.parse(event.data);
      } catch (error) {
         onError?.(error);
         console.log('WS parse error:', error);
         return;
      }

      console.log('WS message:', payload);

      onMessage?.(payload);

      // auth failed на сервере
      if (payload?.type === GEO_WS_MESSAGE_TYPES.ERROR) {
         const message = String(payload?.message || '').toLowerCase();

         if (message.includes('auth failed')) {
            onAuthFailed?.(payload);
         }

         return;
      }

      if (payload?.type === GEO_WS_MESSAGE_TYPES.GET_POINTS) {
         onPoints?.(payload?.data ?? [], payload);
      }
   };
}

function sendGeoWSMessage(ws, payload) {
   if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn('WS send skipped:', {
         payload,
         readyState: ws?.readyState,
      });

      return false;
   }

   console.log('WS send:', payload);

   ws.send(JSON.stringify(payload));

   return true;
}

/**
 * Получить все точки сеанса разово.
 */
export function requestGeoAdminPoints(ws) {
   return sendGeoWSMessage(ws, {
      type: GEO_WS_MESSAGE_TYPES.ADMIN,
   });
}

/**
 * Получить новые точки инкрементально.
 * Сервер вернет точки с id > последнего полученного.
 */
export function requestGeoIncrementalPoints(ws) {
   return sendGeoWSMessage(ws, {
      type: GEO_WS_MESSAGE_TYPES.READ,
   });
}

/**
 * По умолчанию запрашиваем все точки.
 */
export function requestGeoPoints(ws) {
   return requestGeoAdminPoints(ws);
}

export function getBrowserLocation(options = {}) {
   return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
         reject(new Error('Geolocation is not supported in this browser'));
         return;
      }

      navigator.geolocation.getCurrentPosition(
         (pos) => {
            resolve(pos);
         },
         (err) => {
            reject(err);
         },
         {
            enableHighAccuracy: true,
            timeout: 15_000,
            maximumAge: 0,
            ...options,
         },
      );
   });
}

export function sendGeoPoint(ws, point) {
   return sendGeoWSMessage(ws, {
      type: GEO_WS_MESSAGE_TYPES.ADD,
      point: {
         latitude: point.latitude,
         longitude: point.longitude,
         altitude: point.altitude ?? 0,
      },
   });
}

export function sendGeoPoints(ws, points) {
   return sendGeoWSMessage(ws, {
      type: GEO_WS_MESSAGE_TYPES.ADD,
      points: points.map((point) => ({
         latitude: point.latitude,
         longitude: point.longitude,
         altitude: point.altitude ?? 0,
      })),
   });
}

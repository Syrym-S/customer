import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

import { fetchLeadGeoWsToken, normalizeGeoPoints } from './geologic';
import { decodeRoutePolyline } from '../widgets/customer-leads/lib/route-polyline.helpers';

window.Pusher = Pusher;

const REVERB_WSS_PORT = 443;
const REVERB_FORCE_TLS = true;

// Injected per environment by the backend, like window.APP_DATA, but only
// after this bundle loads — so read it on use, not at module level.
function getGeoWsConfig() {
   const config = window?.GeoWS_Config ?? {};

   return {
      appKey: config.key || null,
      wsHost: config.ws || 'geo.v2.360logistics.kz',
   };
}

export function normalizePolylinePoints(encodedPolyline) {
   const decodedPoints = decodeRoutePolyline(encodedPolyline).map(
      ([lat, lon], index) => ({ id: `route-${index}`, lat, lon }),
   );

   return normalizeGeoPoints(decodedPoints);
}

async function fetchGeoRoute(url, token, { signal } = {}) {
   const response = await fetch(url, {
      headers: {
         Authorization: `Bearer ${token}`,
         Accept: 'application/json',
      },
      signal,
   });

   const body = await response.json().catch(() => null);

   if (!response.ok) {
      const error = new Error(
         body?.message || `GeoWS v2 route request failed (${response.status})`,
      );
      error.status = response.status;
      throw error;
   }

   return body?.data ?? null;
}

function subscribeGeoTrackingChannel({ token, routeData, onCoordinate, onError }) {
   const { channel, event, auth_endpoint } = routeData?.websocket ?? {};

   if (!channel || !event || !auth_endpoint) {
      console.warn(
         'GeoWS v2: route response has no websocket config — live updates skipped.',
      );
      return null;
   }

   const { appKey, wsHost } = getGeoWsConfig();

   if (!appKey) {
      console.warn(
         'GeoWS v2: no app key in window.GeoWS_Config — live tracking connection skipped.',
      );
      return null;
   }

   const echo = new Echo({
      broadcaster: 'reverb',
      key: appKey,
      wsHost,
      wssPort: REVERB_WSS_PORT,
      forceTLS: REVERB_FORCE_TLS,
      enabledTransports: ['wss'],
      authEndpoint: auth_endpoint,
      auth: { headers: { Authorization: `Bearer ${token}` } },
   });

   echo.connector?.pusher?.connection?.bind?.('error', (wsError) => {
      console.warn('GeoWS v2: connection error', wsError);
      onError?.(wsError);
   });

   const echoChannel = echo.private(channel).listen(`.${event}`, (payload) => {
      const coords = payload?.data?.coords;

      if (coords) {
         onCoordinate?.(coords, payload?.data);
      }
   });

   try {
      echoChannel?.error?.((subscriptionError) => {
         console.warn('GeoWS v2: subscription error', subscriptionError);
         onError?.(subscriptionError);
      });
   } catch (bindError) {
      console.warn('GeoWS v2: could not bind channel error handler', bindError);
   }

   return echo;
}

function teardownEcho(echo) {
   if (!echo) {
      return;
   }

   try {
      echo.disconnect();
   } catch (error) {
      console.warn('GeoWS v2: error disconnecting Echo', error);
   }
}

/**
 * Public/shared-lead geo tracking connection (customer, read-only) — the
 * url/token are already known (from the shared-lead response's
 * `tracking: { type, token, url }` field), so this skips straight to:
 *  1. GET {url} with the read-token to draw the initial polyline and obtain
 *     websocket.channel / websocket.auth_endpoint.
 *  2. Subscribe via Echo/Reverb, authorizing with
 *     Authorization: Bearer <read-token> against websocket.auth_endpoint.
 *  3. Append every incoming data.coords to the tracked line.
 */
export function openGeoTrackingConnection({ url, token, onRoute, onCoordinate, onError }) {
   const abortController = new AbortController();

   let echo = null;
   let isClosed = false;

   async function start() {
      try {
         if (!url || !token) {
            console.warn(
               'GeoWS v2: missing tracking url/token — live tracking skipped.',
            );
            return;
         }

         const routeData = await fetchGeoRoute(url, token, {
            signal: abortController.signal,
         });

         if (isClosed || !routeData) {
            return;
         }

         onRoute?.(routeData);

         echo = subscribeGeoTrackingChannel({ token, routeData, onCoordinate, onError });

         if (isClosed) {
            teardownEcho(echo);
            echo = null;
         }
      } catch (error) {
         if (error.name === 'AbortError' || isClosed) {
            return;
         }

         console.warn('GeoWS v2: failed to open tracking connection', error);
         onError?.(error);
      }
   }

   start();

   return {
      close() {
         if (isClosed) {
            return;
         }

         isClosed = true;
         abortController.abort();
         teardownEcho(echo);
         echo = null;
      },
   };
}

/**
 * Authenticated geo tracking connection — fetches the geo-token via
 * `/geows/v1/token` first, then follows the same GET + Echo subscription
 * steps as openGeoTrackingConnection. A 404 from the token endpoint means
 * the lead has no geo session yet (created before the geows-v2 migration) —
 * that's reported via onNoSession rather than onError, so callers can fall
 * back to showing the static route without surfacing it as a failure.
 */
export function openLeadGeoTrackingConnection({
   leadId,
   type = 'read',
   onRoute,
   onCoordinate,
   onError,
   onNoSession,
}) {
   const abortController = new AbortController();

   let echo = null;
   let isClosed = false;

   async function start() {
      try {
         const tokenResponse = await fetchLeadGeoWsToken(leadId, type, {
            signal: abortController.signal,
         });

         if (isClosed) {
            return;
         }

         const routeData = await fetchGeoRoute(
            tokenResponse.url,
            tokenResponse.token,
            { signal: abortController.signal },
         );

         if (isClosed || !routeData) {
            return;
         }

         onRoute?.(routeData);

         echo = subscribeGeoTrackingChannel({
            token: tokenResponse.token,
            routeData,
            onCoordinate,
            onError,
         });

         if (isClosed) {
            teardownEcho(echo);
            echo = null;
         }
      } catch (error) {
         if (error.name === 'AbortError' || isClosed) {
            return;
         }

         if (error?.response?.status === 404) {
            onNoSession?.(error);
            return;
         }

         console.warn('GeoWS v2: failed to open lead tracking connection', error);
         onError?.(error);
      }
   }

   start();

   return {
      close() {
         if (isClosed) {
            return;
         }

         isClosed = true;
         abortController.abort();
         teardownEcho(echo);
         echo = null;
      },
   };
}

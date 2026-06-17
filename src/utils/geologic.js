import { apiClient } from '../shared/api/api-client';
import {
   notifyError,
   notifySuccess,
   notifyWarning,
} from '../shared/model/notifications.store';
import { bindGeoWS, connectGeoWS, debugGeoWS, requestGeoPoints } from './geows';

function getGeoWsConfig() {
   const geoConfig = window.GeoWS_Config || {};
   const appData = window.APP_DATA || {};

   return {
      wsUrl: geoConfig.ws || geoConfig.wsUrl,
      userId:
         appData.user_id ||
         appData.userId ||
         geoConfig.user_id ||
         geoConfig.currentUserId ||
         geoConfig.current_user_id ||
         geoConfig.wpUserId ||
         geoConfig.wp_user_id ||
         window.wpApiSettings?.userId ||
         window.wpApiSettings?.user_id ||
         null,
   };
}

function getErrorMessage(error, fallbackMessage) {
   return error?.response?.data?.message || error?.message || fallbackMessage;
}

export function isGeoWsConfigured() {
   const { wsUrl } = getGeoWsConfig();

   return Boolean(wsUrl);
}

function extractGeoPoints(response) {
   if (Array.isArray(response)) {
      return response;
   }

   if (Array.isArray(response?.points)) {
      return response.points;
   }

   if (Array.isArray(response?.data)) {
      return response.data;
   }

   if (Array.isArray(response?.data?.points)) {
      return response.data.points;
   }

   if (response?.point) {
      return [response.point];
   }

   if (response?.data?.point) {
      return [response.data.point];
   }

   return [];
}

function normalizeNumber(value) {
   if (value === null || value === undefined || value === '') {
      return null;
   }

   const numberValue = Number(value);

   return Number.isNaN(numberValue) ? null : numberValue;
}

function normalizeGeoPoint(point, index) {
   const latitude = normalizeNumber(
      point?.latitude ?? point?.lat ?? point?.coords?.latitude,
   );

   const longitude = normalizeNumber(
      point?.longitude ?? point?.lng ?? point?.lon ?? point?.coords?.longitude,
   );

   if (latitude === null || longitude === null) {
      return null;
   }

   return {
      id: point?.id ?? point?._id ?? `${latitude}-${longitude}-${index}`,
      latitude,
      longitude,
      altitude: normalizeNumber(point?.altitude ?? point?.alt) ?? 0,
      recordedAt:
         point?.recorded_at ??
         point?.recordedAt ??
         point?.created_at ??
         point?.timestamp ??
         null,
      raw: point,
   };
}

export function normalizeGeoPoints(points) {
   return (points || [])
      .map(normalizeGeoPoint)
      .filter(Boolean)
      .sort((firstPoint, secondPoint) => {
         if (firstPoint.id !== null && secondPoint.id !== null) {
            return Number(firstPoint.id) - Number(secondPoint.id);
         }

         if (firstPoint.recordedAt && secondPoint.recordedAt) {
            return (
               new Date(firstPoint.recordedAt) -
               new Date(secondPoint.recordedAt)
            );
         }

         return 0;
      });
}

export function mergeGeoPointsById(prevPoints, nextPoints) {
   const pointsMap = new Map();

   [...prevPoints, ...nextPoints].forEach((point) => {
      pointsMap.set(String(point.id), point);
   });

   return Array.from(pointsMap.values()).sort((firstPoint, secondPoint) => {
      const firstId = Number(firstPoint.id);
      const secondId = Number(secondPoint.id);

      if (!Number.isNaN(firstId) && !Number.isNaN(secondId)) {
         return firstId - secondId;
      }

      if (firstPoint.recordedAt && secondPoint.recordedAt) {
         return (
            new Date(firstPoint.recordedAt) - new Date(secondPoint.recordedAt)
         );
      }

      return 0;
   });
}

export function geoPointToLatLng(point) {
   return [point.latitude, point.longitude];
}

function isFalsyGeoResponse(response) {
   return (
      !response ||
      response.success === false ||
      response.status === false ||
      response.error
   );
}

async function fetchLeadGeoWsToken(leadId, type = 'read', { signal } = {}) {
   if (!leadId) {
      throw new Error('Lead ID is missing');
   }

   const response = await apiClient.post(
      '/geows/v1/token',
      {
         lead_id: leadId,
         type,
      },
      {
         signal,
      },
   );

   const data = response.data;

   if (isFalsyGeoResponse(data)) {
      throw new Error(data?.message || 'GeoWS token endpoint returned error');
   }

   if (!data?.token) {
      throw new Error('GeoWS token was not returned');
   }

   return data;
}

function handleGeoWsPayload(payload, handlers = {}) {
   const { onPoints, onMessage } = handlers;

   onMessage?.(payload);

   if (!payload) {
      notifyWarning('GeoWS returned empty message');
      return;
   }

   if (payload.type === 'error') {
      notifyError(payload.message || 'GeoWS returned error', payload);
      return;
   }

   if (
      payload.type === 'read_point' ||
      payload.type === 'add_point' ||
      payload.type === 'get_points' ||
      payload.type === 'record_geo_point'
   ) {
      const rawPoints = extractGeoPoints(payload);
      const normalizedPoints = normalizeGeoPoints(rawPoints);

      if (!rawPoints.length) {
         debugGeoWS('[GeoWS points] empty list', payload);
         onPoints?.([], payload);
         return;
      }

      if (!normalizedPoints.length) {
         notifyWarning('GeoWS response does not contain valid points', payload);
         return;
      }

      console.log('[GeoWS normalized points]', normalizedPoints);
      onPoints?.(normalizedPoints, payload);
   }
}

export function openLeadGeoConnection({
   leadId,
   mode = 'read',
   onOpen,
   onClose,
   onError,
   onAuthFailed,
   onPoints,
   onMessage,
}) {
   const abortController = new AbortController();

   let ws = null;
   let isClosed = false;
   let pollTimerId = null;

   function stopPolling() {
      if (pollTimerId) {
         clearInterval(pollTimerId);
         pollTimerId = null;
      }
   }

   async function start() {
      try {
         const { wsUrl, userId } = getGeoWsConfig();

         if (!wsUrl) {
            notifyWarning('GeoWS config is not available', {
               wsUrl,
            });

            return;
         }

         if (!userId) {
            throw new Error('GeoWS user_id is not available');
         }

         const tokenResponse = await fetchLeadGeoWsToken(leadId, mode, {
            signal: abortController.signal,
         });

         if (isClosed) return;

         const wsToken = tokenResponse.token;

         ws = connectGeoWS({
            wsUrl,
            token: wsToken,
            userId,
         });

         bindGeoWS(ws, {
            onOpen: () => {
               if (isClosed) {
                  ws?.close();
                  return;
               }

               if (mode === 'read') {
                  requestGeoPoints(ws);
                  pollTimerId = setInterval(() => {
                     requestGeoPoints(ws);
                  }, 5000);
               }

               notifySuccess('GeoWS connection opened', {
                  leadId,
                  mode,
               });

               onOpen?.();
            },

            onClose: (event) => {
               stopPolling();
               onClose?.(event);
            },

            onError: (event) => {
               stopPolling();
               notifyError('GeoWS connection error', event);
               onError?.(event);
            },

            onAuthFailed: (payload) => {
               notifyError('GeoWS authorization failed', payload);
               onAuthFailed?.(payload);
            },

            onMessage: (payload) => {
               handleGeoWsPayload(payload, {
                  onPoints,
                  onMessage,
               });
            },
         });
      } catch (error) {
         if (error.name === 'AbortError' || isClosed) {
            return;
         }

         const message = getErrorMessage(
            error,
            'Failed to open GeoWS connection',
         );

         notifyError(message, {
            leadId,
            error,
         });

         onError?.(error);
      }
   }

   start();

   return {
      close() {
         isClosed = true;
         abortController.abort();
         stopPolling();

         if (
            ws &&
            (ws.readyState === WebSocket.OPEN ||
               ws.readyState === WebSocket.CONNECTING)
         ) {
            ws.close();
         }

         ws = null;
      },
   };
}

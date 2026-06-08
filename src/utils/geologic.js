import { apiClient } from '../shared/api/apiClient';
import {
   notifyError,
   notifySuccess,
   notifyWarning,
} from '../shared/model/notifications.store';
import { bindGeoWS, connectGeoWS, requestGeoPoints } from './geows';

function getGeoWsConfig() {
   const { ws } = window.GeoWS_Config || {};

   return {
      wsUrl: ws,
   };
}

function getErrorMessage(error, fallbackMessage) {
   return error?.response?.data?.message || error?.message || fallbackMessage;
}

export function isGeoWsConfigured() {
   const { wsUrl } = getGeoWsConfig();

   return Boolean(wsUrl);
}

function extractGeoToken(response) {
   return (
      response?.token ||
      response?.data?.token ||
      response?.session ||
      response?.data?.session ||
      null
   );
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

function isFalsyGeoResponse(response) {
   return (
      !response ||
      response.success === false ||
      response.status === false ||
      response.error
   );
}

async function fetchLeadGeoSession(leadId, { signal } = {}) {
   if (!leadId) {
      throw new Error('Lead ID is missing');
   }

   const response = await apiClient.get('/geows/v1/get', {
      params: {
         lead_id: leadId,
      },
      signal,
   });

   const data = response.data;

   if (isFalsyGeoResponse(data)) {
      throw new Error(data?.message || 'GeoWS returned empty response');
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
      const points = extractGeoPoints(payload);

      if (!points.length) {
         notifyWarning('GeoWS response does not contain points', payload);
         return;
      }

      console.log('[GeoWS points]', points);
      onPoints?.(points, payload);
   }
}

export function openLeadGeoConnection({
   leadId,
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

   async function start() {
      try {
         const { wsUrl } = getGeoWsConfig();

         if (!wsUrl) {
            notifyWarning('GeoWS config is not available', {
               wsUrl,
            });

            return;
         }

         const geoSessionResponse = await fetchLeadGeoSession(leadId, {
            signal: abortController.signal,
         });

         if (isClosed) return;

         const token = extractGeoToken(geoSessionResponse);

         if (!token) {
            throw new Error('GeoWS token missing');
         }

         ws = connectGeoWS({
            wsUrl,
            token,
         });

         bindGeoWS(ws, {
            onOpen: () => {
               if (isClosed) {
                  ws?.close();
                  return;
               }

               requestGeoPoints(ws);

               notifySuccess('GeoWS connection opened', {
                  leadId,
               });

               onOpen?.();
            },

            onClose: (event) => {
               onClose?.(event);
            },

            onError: (event) => {
               notifyError('GeoWS connection error', event);
               onError?.(event);
            },

            onAuthFailed: (payload) => {
               notifyError('GeoWS authorization failed', payload);
               onAuthFailed?.(payload);
            },

            onPoints: (points) => {
               if (!points?.length) {
                  notifyWarning('GeoWS returned empty points list');
                  return;
               }

               console.log('[GeoWS get_points]', points);
               onPoints?.(points);
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

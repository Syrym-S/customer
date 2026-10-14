import { useCallback, useEffect, useRef, useState } from 'react';

import { mergeGeoPointsById, normalizeGeoPoints } from '../../../../../utils/geologic';
import {
   normalizePolylinePoints,
   openGeoTrackingConnection,
} from '../../../../../utils/geoTrackingV2';

// Public/unauthenticated counterpart of useLeadDetailsGeoTracking.js — same
// shape/return value, but driven by the shared-lead response's
// `tracking: { type, token, url }` field (only present under lead.raw, since
// mapLeadFromApi doesn't map it — same situation as the `routes` field).
//
// geows-v2 contract for this flow (customer, read-only):
//  1. type is always "read" here — the public link never gets an add-token.
//  2. GET tracking.url with tracking.token draws the initial polyline and
//     returns websocket.channel/auth_endpoint for live updates.
//  3. Live updates are an Echo/Reverb subscription, not a raw WebSocket.
//  4. Every incoming data.coords is appended to the tracked line.
export function useSharedLeadGeoTracking(lead) {
   const [geoPoints, setGeoPoints] = useState([]);
   const [geoCurrentPoint, setGeoCurrentPoint] = useState(null);

   const geoConnectionRef = useRef(null);

   const closeGeoConnection = useCallback(() => {
      geoConnectionRef.current?.close();
      geoConnectionRef.current = null;
   }, []);

   const resetGeoTracking = useCallback(() => {
      closeGeoConnection();
      setGeoPoints([]);
      setGeoCurrentPoint(null);
   }, [closeGeoConnection]);

   const leadId = lead?.id;
   const tracking = lead?.raw?.tracking;
   const trackingToken = tracking?.token;
   const trackingUrl = tracking?.url;
   const trackingType = tracking?.type;

   useEffect(() => {
      resetGeoTracking();

      // No tracking field on this lead yet (e.g. driver not assigned/no
      // active trip) — just show the static route, same as today.
      if (!leadId || !trackingToken || !trackingUrl) {
         return;
      }

      if (trackingType && trackingType !== 'read') {
         console.warn(
            `Shared lead GeoWS v2: expected a read-token, got type "${trackingType}" — skipping live tracking.`,
         );
         return;
      }

      const connection = openGeoTrackingConnection({
         url: trackingUrl,
         token: trackingToken,

         onRoute: (routeData) => {
            const initialPoints = normalizePolylinePoints(routeData?.polyline);

            if (!initialPoints.length) {
               return;
            }

            setGeoPoints(initialPoints);
            setGeoCurrentPoint(initialPoints.at(-1) ?? null);
         },

         onCoordinate: (coords) => {
            const [nextPoint] = normalizeGeoPoints([coords]);

            if (!nextPoint) {
               return;
            }

            setGeoPoints((prevPoints) => {
               const nextPoints = mergeGeoPointsById(prevPoints, [nextPoint]);

               setGeoCurrentPoint(nextPoints.at(-1) ?? null);

               return nextPoints;
            });
         },

         onError: (error) => {
            console.error('Shared lead GeoWS v2 error:', error);
         },
      });

      geoConnectionRef.current = connection;

      return () => {
         connection.close();

         if (geoConnectionRef.current === connection) {
            geoConnectionRef.current = null;
         }
      };
   }, [leadId, trackingToken, trackingUrl, trackingType, resetGeoTracking]);

   return {
      geoPoints,
      geoCurrentPoint,
      resetGeoTracking,
   };
}

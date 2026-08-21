import { useCallback, useEffect, useRef, useState } from 'react';

import {
   isGeoWsConfigured,
   mergeGeoPointsById,
   openLeadGeoConnection,
} from '../../../../../utils/geologic';

// Public/unauthenticated counterpart of useLeadDetailsGeoTracking.js — same
// shape/return value, but driven by the shared-lead response's
// `tracking: { type, token, seance }` field (only present under lead.raw,
// since mapLeadFromApi doesn't map it — same situation as the `routes`
// field) instead of a WordPress-session-authenticated /geows/v1/token call.
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
   const shareToken = tracking?.token;
   const shareSeance = tracking?.seance;
   const trackingMode = tracking?.type || 'read';

   useEffect(() => {
      resetGeoTracking();

      // No tracking field on this lead yet (e.g. driver not assigned/no
      // active trip) — just show the static route, same as today.
      if (!leadId || !shareToken) {
         return;
      }

      if (!isGeoWsConfigured()) {
         console.info(
            'GeoWS is not configured for this environment — live tracking unavailable on this shared-lead page.',
         );

         return;
      }

      const connection = openLeadGeoConnection({
         leadId,
         mode: trackingMode,
         silent: true,
         shareToken,
         shareSeance,

         onError: (error) => {
            console.error('Shared lead GeoWS error:', error);
         },

         onAuthFailed: (payload) => {
            console.error('Shared lead GeoWS auth failed:', payload);
         },

         onPoints: (points) => {
            if (!points?.length) {
               return;
            }

            setGeoPoints((prevPoints) => {
               const nextPoints = mergeGeoPointsById(prevPoints, points);

               setGeoCurrentPoint(nextPoints.at(-1) ?? null);

               return nextPoints;
            });
         },
      });

      geoConnectionRef.current = connection;

      return () => {
         connection.close();

         if (geoConnectionRef.current === connection) {
            geoConnectionRef.current = null;
         }
      };
   }, [leadId, shareToken, shareSeance, trackingMode, resetGeoTracking]);

   return {
      geoPoints,
      geoCurrentPoint,
      resetGeoTracking,
   };
}

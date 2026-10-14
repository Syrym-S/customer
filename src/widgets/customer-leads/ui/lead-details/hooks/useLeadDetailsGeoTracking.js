import { useCallback, useEffect, useRef, useState } from 'react';

import { mergeGeoPointsById, normalizeGeoPoints } from '../../../../../utils/geologic';
import {
   normalizePolylinePoints,
   openLeadGeoTrackingConnection,
} from '../../../../../utils/geoTrackingV2';

export function useLeadDetailsGeoTracking(leadId) {
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

   useEffect(() => {
      resetGeoTracking();

      if (!leadId) {
         return;
      }

      const connection = openLeadGeoTrackingConnection({
         leadId,
         type: 'read',

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

         // Lead created before the geows-v2 migration has no geo session —
         // just show the static route, same as today.
         onNoSession: () => {
            console.info(`Lead ${leadId} has no geo session — live tracking unavailable.`);
         },

         onError: (error) => {
            console.error('Lead GeoWS v2 error:', error);
         },
      });

      geoConnectionRef.current = connection;

      return () => {
         connection.close();

         if (geoConnectionRef.current === connection) {
            geoConnectionRef.current = null;
         }
      };
   }, [leadId, resetGeoTracking]);

   return {
      geoPoints,
      geoCurrentPoint,
      resetGeoTracking,
   };
}

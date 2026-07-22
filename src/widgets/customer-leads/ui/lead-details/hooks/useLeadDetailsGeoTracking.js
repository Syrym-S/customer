import { useCallback, useEffect, useRef, useState } from 'react';

import {
   isGeoWsConfigured,
   mergeGeoPointsById,
   openLeadGeoConnection,
} from '../../../../../utils/geologic';

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

      if (!isGeoWsConfigured()) {
         console.info('GeoWS is not configured for this environment');
         return;
      }

      const connection = openLeadGeoConnection({
         leadId,

         onError: (error) => {
            console.error('Lead GeoWS error:', error);
         },

         onAuthFailed: (payload) => {
            console.error('Lead GeoWS auth failed:', payload);
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
   }, [leadId, resetGeoTracking]);

   return {
      geoPoints,
      geoCurrentPoint,
      resetGeoTracking,
   };
}

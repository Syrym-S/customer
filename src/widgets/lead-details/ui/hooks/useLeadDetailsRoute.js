import { useEffect, useState } from 'react';

import {
   buildFallbackLeadRoutePoints,
   buildLeadRoutePayload,
} from '../../../../features/view-lead-routes/lib/lead-route-generation.helpers';
import {
   decodeRoutePolyline,
   getEncodedPolylineFromRoute,
   getRoutesFromGeneratedRoute,
} from '../../../../shared/lib/route/route-polyline.helpers';
import { generateRoute } from '../../../../shared/api/routing.api';

export function useLeadDetailsRoute(leadDetails) {
   const [route, setRoute] = useState(null);
   const [routePoints, setRoutePoints] = useState([]);
   const [isRouteLoading, setIsRouteLoading] = useState(false);

   function resetRoute() {
      setRoute(null);
      setRoutePoints([]);
      setIsRouteLoading(false);
   }

   useEffect(() => {
      if (!leadDetails?.id) {
         resetRoute();
         return;
      }

      let isCancelled = false;

      async function loadLeadRoute() {
         try {
            setIsRouteLoading(true);
            setRoute(null);
            setRoutePoints([]);

            const payload = buildLeadRoutePayload(leadDetails);

            if (!payload) {
               return;
            }

            const generatedRoute = await generateRoute(payload);

            if (isCancelled || !generatedRoute) {
               return;
            }

            const routes = getRoutesFromGeneratedRoute(generatedRoute);
            const mainRoute = routes[0];

            if (!mainRoute) {
               console.warn('Маршруты не найдены в response:', generatedRoute);

               setRoute(null);
               setRoutePoints(buildFallbackLeadRoutePoints(leadDetails));

               return;
            }

            const encodedPolyline = getEncodedPolylineFromRoute(mainRoute);
            const decodedPoints = decodeRoutePolyline(encodedPolyline);

            if (!decodedPoints.length) {
               console.warn('Polyline не декодировался:', {
                  generatedRoute,
                  mainRoute,
                  encodedPolyline,
               });

               setRoute(null);
               setRoutePoints(buildFallbackLeadRoutePoints(leadDetails));

               return;
            }

            setRoute(mainRoute);
            setRoutePoints(decodedPoints);
         } finally {
            if (!isCancelled) {
               setIsRouteLoading(false);
            }
         }
      }

      loadLeadRoute();

      return () => {
         isCancelled = true;
      };
   }, [leadDetails]);

   return {
      route,
      routePoints,
      isRouteLoading,
      resetRoute,
   };
}

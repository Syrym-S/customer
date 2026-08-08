import { useEffect, useMemo, useState } from 'react';
import {
   buildFallbackLeadRoutePoints,
   buildLeadRoutePayload,
} from '../lib/lead-route-generation.helpers';
import {
   buildGeneratedRouteCacheKey,
   getGeneratedRouteWithCache,
} from './generated-route.cache';
import { generateRoute } from '../../../shared/api/routing.api';
import {
   decodeRoutePolyline,
   getEncodedPolylineFromRoute,
   getRoutesFromGeneratedRoute,
} from '../../../shared/lib/route/route-polyline.helpers';

function buildLeadRouteKey(lead) {
   if (!lead?.id) {
      return '';
   }

   return JSON.stringify({
      id: lead.id,
      from: lead.from_location || null,
      to: lead.to_location || null,
      waypoints: Array.isArray(lead.waypoints) ? lead.waypoints : [],
   });
}

export function useLeadRoute(lead, { enabled = true } = {}) {
   const [route, setRoute] = useState(null);
   const [routePoints, setRoutePoints] = useState([]);
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState('');

   const routeKey = useMemo(() => buildLeadRouteKey(lead), [lead]);

   useEffect(() => {
      if (!enabled || !routeKey || !lead?.id) {
         setRoute(null);
         setRoutePoints([]);
         setIsLoading(false);
         setError('');
         return;
      }

      let isCancelled = false;

      async function loadRoute() {
         try {
            setIsLoading(true);
            setError('');

            const payload = buildLeadRoutePayload(lead);

            if (!payload) {
               setRoute(null);
               setRoutePoints([]);
               return;
            }

            const cacheKey = buildGeneratedRouteCacheKey(payload);

            const response = await getGeneratedRouteWithCache(cacheKey, () =>
               generateRoute(payload),
            );

            const mainRoute = getRoutesFromGeneratedRoute(response)[0] || null;

            if (isCancelled) {
               return;
            }

            if (!mainRoute) {
               setRoute(null);
               setRoutePoints(buildFallbackLeadRoutePoints(lead));
               return;
            }

            const encodedPolyline = getEncodedPolylineFromRoute(mainRoute);

            const points = decodeRoutePolyline(encodedPolyline);

            setRoute(mainRoute);
            setRoutePoints(
               points.length ? points : buildFallbackLeadRoutePoints(lead),
            );
         } catch (requestError) {
            if (isCancelled) {
               return;
            }

            setRoute(null);
            setRoutePoints(buildFallbackLeadRoutePoints(lead));
            setError(requestError.message || 'Не удалось построить маршрут');
         } finally {
            if (!isCancelled) {
               setIsLoading(false);
            }
         }
      }

      loadRoute();

      return () => {
         isCancelled = true;
      };
   }, [enabled, lead, routeKey]);

   return {
      route,
      routePoints,
      isLoading,
      error,
   };
}

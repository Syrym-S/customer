import { useEffect, useState } from 'react';
import {
   decodeRoutePolyline,
   getEncodedPolylineFromRoute,
   getRoutesFromGeneratedRoute,
} from '../../../shared/lib/route/route-polyline.helpers';
import { buildLeadRoutePayload } from '../lib/lead-route-generation.helpers';
import { generateRoute } from '../../../shared/api/routing.api';
import {
   buildGeneratedRouteCacheKey,
   getGeneratedRouteWithCache,
} from './generated-route.cache';

function mapGeneratedRouteToMapRoute(lead, generatedRoute) {
   const routes = getRoutesFromGeneratedRoute(generatedRoute);
   const mainRoute = routes[0];

   if (!mainRoute) {
      return null;
   }

   const encodedPolyline = getEncodedPolylineFromRoute(mainRoute);
   const points = decodeRoutePolyline(encodedPolyline);

   if (points.length < 2) {
      return null;
   }

   return {
      id: lead.id,
      lead,
      route: mainRoute,
      points,
   };
}

export function useLeadRoutes(leads) {
   const [routes, setRoutes] = useState([]);
   const [isRoutesLoading, setIsRoutesLoading] = useState(false);
   const [routesError, setRoutesError] = useState(null);

   useEffect(() => {
      if (!leads.length) {
         setRoutes([]);
         setRoutesError(null);
         return;
      }

      let isCancelled = false;

      async function loadRoutes() {
         try {
            setIsRoutesLoading(true);
            setRoutesError(null);
            setRoutes([]);

            const routeResults = await Promise.all(
               leads.map(async (lead) => {
                  try {
                     const payload = buildLeadRoutePayload(lead);

                     if (!payload) {
                        return null;
                     }

                     const routeCacheKey = buildGeneratedRouteCacheKey(payload);

                     const generatedRoute = await getGeneratedRouteWithCache(
                        routeCacheKey,
                        () => generateRoute(payload),
                     );

                     if (!generatedRoute) {
                        return null;
                     }

                     return mapGeneratedRouteToMapRoute(lead, generatedRoute);
                  } catch (error) {
                     console.error('Ошибка генерации маршрута лида:', {
                        leadId: lead.id,
                        error,
                     });

                     return null;
                  }
               }),
            );

            if (!isCancelled) {
               setRoutes(routeResults.filter(Boolean));
            }
         } catch (error) {
            if (!isCancelled) {
               setRoutesError(error.message || 'Не удалось загрузить маршруты');
               setRoutes([]);
            }
         } finally {
            if (!isCancelled) {
               setIsRoutesLoading(false);
            }
         }
      }

      loadRoutes();

      return () => {
         isCancelled = true;
      };
   }, [leads]);

   return {
      routes,
      isRoutesLoading,
      routesError,
   };
}

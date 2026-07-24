import { useEffect, useState } from "react";

import { generateRoute } from "../../customer-leads/api/lead-route.repository";
import {
   buildLeadRoutePayload,
   decodeRoutePolyline,
   getEncodedPolylineFromRoute,
   getRoutesFromGeneratedRoute,
} from "../../customer-leads/lib/route-polyline.helpers";
import {
   buildGeneratedRouteCacheKey,
   getGeneratedRouteWithCache,
} from "./routes-cache";

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

export function useCustomerPageRoutes(leads) {
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
                     console.error("Ошибка генерации маршрута лида:", {
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
               setRoutesError(error.message || "Не удалось загрузить маршруты");
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

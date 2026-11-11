import { useEffect, useMemo, useState } from 'react';

import i18n from '../../../shared/i18n';

import {
   buildLiveGeoPoint,
   geoPointToLatLng,
   mergeGeoPointsById,
   normalizeGeoPoints,
} from '../../../utils/geologic';
import {
   normalizePolylinePoints,
   openGeoTrackingChannel,
} from '../../../utils/geoTrackingV2';

import { leadPolylineStatuses } from '../../customer-leads/api/lead-polylines.api';
import { fetchLeadPolylines } from '../../customer-leads/api/lead-polylines.repository';
import { generateRoute } from '../../customer-leads/api/lead-route.repository';
import {
   buildLeadRoutePayload,
   decodeRoutePolyline,
   getEncodedPolylineFromRoute,
   getRoutesFromGeneratedRoute,
} from '../../customer-leads/lib/route-polyline.helpers';
import {
   getLeadId,
   isLeadTrackingActive,
} from '../../customer-leads/model/lead.helpers';

import {
   buildLeadPolylinesRequestKey,
   deleteCachedLeadPolylineEntry,
   fetchLeadPolylinesWithRequestCache,
   getCachedLeadPolylineEntry,
   setCachedLeadPolylineEntry,
   updateCachedLeadGeoRoute,
} from './lead-polylines-cache';

function buildLeadsKey(leads) {
   return leads
      .filter((lead) => Boolean(getLeadId(lead)))
      .map((lead) => `${getLeadId(lead)}:${lead?.status || ''}`)
      .join('|');
}

function attachLeadToRoute(route, lead) {
   if (!route) {
      return null;
   }

   return {
      ...route,
      lead,
   };
}

function upsertRoute(prevRoutes, nextRoute) {
   const routeIndex = prevRoutes.findIndex(
      (route) => String(route.id) === String(nextRoute.id),
   );

   if (routeIndex === -1) {
      return [...prevRoutes, nextRoute];
   }

   return prevRoutes.map((route, index) =>
      index === routeIndex ? nextRoute : route,
   );
}

function buildPlannedRoute(leadId, encodedRoutePolyline) {
   const points = decodeRoutePolyline(encodedRoutePolyline);

   if (points.length < 2) {
      return null;
   }

   return {
      id: leadId,
      points,
   };
}

function buildGeoRoute(leadId, rawPoints) {
   if (!rawPoints.length) {
      return null;
   }

   const points = rawPoints.map(geoPointToLatLng);

   return {
      id: leadId,
      rawPoints,
      points,
      currentPoint: points.at(-1) || null,
   };
}

function isFailedPolylineStatus(status) {
   return (
      status === leadPolylineStatuses.FORBIDDEN ||
      status === leadPolylineStatuses.NOT_FOUND
   );
}

async function generateFallbackPlannedRoute(lead) {
   const payload = buildLeadRoutePayload(lead);

   if (!payload) {
      return null;
   }

   const generatedRoute = await generateRoute(payload);
   const [mainRoute] = getRoutesFromGeneratedRoute(generatedRoute);

   if (!mainRoute) {
      return null;
   }

   const plannedRoute = buildPlannedRoute(
      String(getLeadId(lead)),
      getEncodedPolylineFromRoute(mainRoute),
   );

   if (!plannedRoute) {
      return null;
   }

   return {
      lead,
      plannedRoute: {
         ...plannedRoute,
         route: mainRoute,
      },
   };
}

function generateFallbackPlannedRoutes(leadsToLoad) {
   return Promise.all(
      leadsToLoad.map(async (lead) => {
         try {
            return await generateFallbackPlannedRoute(lead);
         } catch (error) {
            console.warn('Customer page fallback route failed:', {
               leadId: getLeadId(lead),
               error,
            });

            return null;
         }
      }),
   );
}

function resolveRequestErrorMessage(requestError) {
   return (
      requestError?.response?.data?.message ||
      requestError?.message ||
      i18n.t('map.routesLoadFailed')
   );
}

export function useCustomerPageMapRoutes(leads) {
   const [routes, setRoutes] = useState([]);
   const [geoRoutes, setGeoRoutes] = useState([]);
   const [isMapRoutesLoading, setIsMapRoutesLoading] = useState(false);
   const [mapRoutesError, setMapRoutesError] = useState(null);

   const leadsKey = useMemo(() => buildLeadsKey(leads), [leads]);

   useEffect(() => {
      const leadsWithId = leads.filter((lead) => Boolean(getLeadId(lead)));

      if (!leadsWithId.length) {
         setRoutes([]);
         setGeoRoutes([]);
         setMapRoutesError(null);
         setIsMapRoutesLoading(false);

         return undefined;
      }

      let isCancelled = false;

      const connections = [];

      const leadsById = new Map(
         leadsWithId.map((lead) => [String(getLeadId(lead)), lead]),
      );

      function mergeLeadGeoPoints(leadId, newPoints) {
         if (!newPoints.length) {
            return;
         }

         setGeoRoutes((prevRoutes) => {
            const currentRoute = prevRoutes.find(
               (route) => String(route.id) === leadId,
            );

            const mergedPoints = mergeGeoPointsById(
               currentRoute?.rawPoints || [],
               newPoints,
            );

            const nextRoute = buildGeoRoute(leadId, mergedPoints);

            if (!nextRoute) {
               return prevRoutes;
            }

            updateCachedLeadGeoRoute(leadId, nextRoute);

            return upsertRoute(
               prevRoutes,
               attachLeadToRoute(nextRoute, leadsById.get(leadId)),
            );
         });
      }

      function subscribeLeadTracking(leadId, item) {
         if (item?.status !== leadPolylineStatuses.OK) {
            return;
         }

         if (!isLeadTrackingActive(leadsById.get(leadId)?.status)) {
            return;
         }

         const connection = openGeoTrackingChannel({
            token: item.token,
            websocket: item.websocket,

            onCoordinate: (coords, eventData) => {
               if (isCancelled) {
                  return;
               }

               mergeLeadGeoPoints(
                  leadId,
                  normalizeGeoPoints([buildLiveGeoPoint(coords, eventData)]),
               );
            },

            onError: (error) => {
               console.warn('Customer page GeoWS tracking failed:', {
                  leadId,
                  error,
               });
            },
         });

         if (connection) {
            connections.push(connection);
         }
      }

      const cachedPlannedRoutes = [];
      const cachedGeoRoutes = [];
      const leadsWithoutFreshCache = [];

      leadsWithId.forEach((lead) => {
         const leadId = String(getLeadId(lead));
         const cachedEntry = getCachedLeadPolylineEntry(leadId);

         if (!cachedEntry) {
            leadsWithoutFreshCache.push(lead);

            return;
         }

         if (cachedEntry.plannedRoute) {
            cachedPlannedRoutes.push(
               attachLeadToRoute(cachedEntry.plannedRoute, lead),
            );
         }

         if (cachedEntry.geoRoute) {
            cachedGeoRoutes.push(attachLeadToRoute(cachedEntry.geoRoute, lead));
         }

         subscribeLeadTracking(leadId, cachedEntry.item);
      });

      setRoutes(cachedPlannedRoutes);
      setGeoRoutes(cachedGeoRoutes);
      setMapRoutesError(null);

      if (leadsWithoutFreshCache.length) {
         setIsMapRoutesLoading(true);

         const requestKey = buildLeadPolylinesRequestKey(
            leadsWithoutFreshCache.map((lead) => String(getLeadId(lead))),
         );

         fetchLeadPolylinesWithRequestCache(requestKey, () =>
            fetchLeadPolylines(leadsWithoutFreshCache),
         )
            .then((items) => {
               if (isCancelled) {
                  return;
               }

               const nextPlannedRoutes = [];
               const nextGeoRoutes = [];

               let failedCount = 0;

               items.forEach((item) => {
                  const leadId = String(item?.lead_id || '');
                  const lead = leadsById.get(leadId);

                  if (!leadId || !lead) {
                     return;
                  }

                  if (isFailedPolylineStatus(item?.status)) {
                     failedCount += 1;
                     deleteCachedLeadPolylineEntry(leadId);

                     return;
                  }

                  const plannedRoute = buildPlannedRoute(
                     leadId,
                     item?.route_polyline,
                  );

                  const geoRoute = buildGeoRoute(
                     leadId,
                     normalizePolylinePoints(item?.polyline),
                  );

                  setCachedLeadPolylineEntry(leadId, {
                     item,
                     plannedRoute,
                     geoRoute,
                  });

                  if (plannedRoute) {
                     nextPlannedRoutes.push(
                        attachLeadToRoute(plannedRoute, lead),
                     );
                  }

                  if (geoRoute) {
                     nextGeoRoutes.push(attachLeadToRoute(geoRoute, lead));
                  }

                  subscribeLeadTracking(leadId, item);
               });

               setRoutes((prevRoutes) =>
                  nextPlannedRoutes.reduce(upsertRoute, prevRoutes),
               );

               setGeoRoutes((prevRoutes) =>
                  nextGeoRoutes.reduce(upsertRoute, prevRoutes),
               );

               setIsMapRoutesLoading(false);

               if (failedCount > 0) {
                  setMapRoutesError(
                     i18n.t('map.routesPartialFailure', {
                        failed: failedCount,
                        total: leadsWithoutFreshCache.length,
                     }),
                  );
               }
            })
            .catch((requestError) => {
               if (isCancelled) {
                  return;
               }

               if (requestError?.code === 'CONTRACT_GATE_BLOCKED') {
                  setIsMapRoutesLoading(false);

                  return;
               }

               console.warn(
                  'Customer page polylines request failed:',
                  requestError,
               );

               fetchLeadPolylinesWithRequestCache(
                  `${requestKey}:planned-fallback`,
                  () => generateFallbackPlannedRoutes(leadsWithoutFreshCache),
               )
                  .then((fallbackResults) => {
                     if (isCancelled) {
                        return;
                     }

                     const fallbackRoutes = fallbackResults.filter(Boolean);

                     fallbackRoutes.forEach(({ lead, plannedRoute }) => {
                        setCachedLeadPolylineEntry(String(getLeadId(lead)), {
                           item: null,
                           plannedRoute,
                           geoRoute: null,
                        });
                     });

                     setRoutes((prevRoutes) =>
                        fallbackRoutes
                           .map(({ lead, plannedRoute }) =>
                              attachLeadToRoute(plannedRoute, lead),
                           )
                           .reduce(upsertRoute, prevRoutes),
                     );

                     setIsMapRoutesLoading(false);

                     if (!fallbackRoutes.length) {
                        setMapRoutesError(
                           resolveRequestErrorMessage(requestError),
                        );
                     }
                  })
                  .catch((fallbackError) => {
                     if (isCancelled) {
                        return;
                     }

                     console.warn(
                        'Customer page fallback routes failed:',
                        fallbackError,
                     );

                     setIsMapRoutesLoading(false);
                     setMapRoutesError(
                        resolveRequestErrorMessage(requestError),
                     );
                  });
            });
      } else {
         setIsMapRoutesLoading(false);
      }

      return () => {
         isCancelled = true;

         connections.forEach((connection) => {
            connection.close();
         });
      };
   }, [leads, leadsKey]);

   return {
      routes,
      geoRoutes,
      isMapRoutesLoading,
      mapRoutesError,
   };
}

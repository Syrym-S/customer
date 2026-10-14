import { useEffect, useMemo, useState } from "react";

import { geoPointToLatLng, mergeGeoPointsById, normalizeGeoPoints } from "../../../utils/geologic";
import {
    normalizePolylinePoints,
    openLeadGeoTrackingConnection,
} from "../../../utils/geoTrackingV2";

import {
    deleteCachedGeoRoute,
    getCachedGeoRouteEntry,
    setCachedEmptyGeoRoute,
    setCachedGeoRoute,
} from "./geo-routes-cache";

function getLeadId(lead) {
    return lead?.id || lead?._id || lead?.lead_id || lead?.leadId || "";
}

function buildLeadsKey(leads) {
    return leads
        .map((lead) => getLeadId(lead))
        .filter(Boolean)
        .join("|");
}

function upsertGeoRoute(prevRoutes, nextRoute) {
    const routeIndex = prevRoutes.findIndex(
        (route) => String(route.id) === String(nextRoute.id),
    );

    if (routeIndex === -1) {
        return [...prevRoutes, nextRoute];
    }

    return prevRoutes.map((route, index) => {
        if (index !== routeIndex) {
            return route;
        }

        return nextRoute;
    });
}

function mapGeoPointsToRoutePoints(points) {
    return points.map(geoPointToLatLng);
}

function attachActualLeadToCachedRoute(cachedRoute, lead) {
    if (!cachedRoute) {
        return null;
    }

    return {
        ...cachedRoute,
        lead,
    };
}

export function useCustomerPageGeoRoutes(leads) {
    const [geoRoutes, setGeoRoutes] = useState([]);
    const [isGeoRoutesLoading, setIsGeoRoutesLoading] = useState(false);
    const [geoRoutesError, setGeoRoutesError] = useState(null);

    const leadsKey = useMemo(() => buildLeadsKey(leads), [leads]);

    useEffect(() => {
        if (!leads.length) {
            setGeoRoutes([]);
            setGeoRoutesError(null);
            setIsGeoRoutesLoading(false);
            return undefined;
        }

        let isCancelled = false;
        const connections = [];
        const failedLeadIds = new Set();

        const handledLeadIds = new Set();

        const leadsWithId = leads.filter((lead) => Boolean(getLeadId(lead)));

        if (!leadsWithId.length) {
            setGeoRoutes([]);
            setGeoRoutesError(null);
            setIsGeoRoutesLoading(false);
            return undefined;
        }

        const cachedRoutes = [];
        const leadsWithoutFreshCache = [];

        leadsWithId.forEach((lead) => {
            const leadId = String(getLeadId(lead));
            const cachedEntry = getCachedGeoRouteEntry(leadId);

            if (cachedEntry) {
                if (cachedEntry.route) {
                    cachedRoutes.push(
                        attachActualLeadToCachedRoute(cachedEntry.route, lead),
                    );
                }

                return;
            }

            leadsWithoutFreshCache.push(lead);
        });

        setGeoRoutes(cachedRoutes.filter(Boolean));
        setGeoRoutesError(null);

        if (!leadsWithoutFreshCache.length) {
            setIsGeoRoutesLoading(false);
            return undefined;
        }

        setIsGeoRoutesLoading(true);

        function showGeoRoutesSummaryIfReady() {
            if (isCancelled) {
                return;
            }

            if (handledLeadIds.size < leadsWithoutFreshCache.length) {
                return;
            }

            setIsGeoRoutesLoading(false);

            const failedCount = failedLeadIds.size;

            if (failedCount > 0) {
                setGeoRoutesError(
                    `Не удалось загрузить GeoWS-маршруты для ${failedCount} из ${leadsWithoutFreshCache.length} заказов`,
                );
            }
        }

        function markLeadHandled(leadId, status) {
            if (handledLeadIds.has(leadId)) {
                return;
            }

            handledLeadIds.add(leadId);

            if (status === "failed") {
                failedLeadIds.add(leadId);
            }

            showGeoRoutesSummaryIfReady();
        }

        function mergeLeadGeoPoints(leadId, lead, newPoints) {
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

                if (!mergedPoints.length) {
                    return prevRoutes;
                }

                const routePoints = mapGeoPointsToRoutePoints(mergedPoints);
                const currentPoint = routePoints.at(-1) || null;

                const nextRoute = {
                    id: leadId,
                    lead,
                    rawPoints: mergedPoints,
                    points: routePoints,
                    currentPoint,
                };

                setCachedGeoRoute(leadId, nextRoute);

                return upsertGeoRoute(prevRoutes, nextRoute);
            });
        }

        leadsWithoutFreshCache.forEach((lead) => {
            const leadId = String(getLeadId(lead));

            const connection = openLeadGeoTrackingConnection({
                leadId,
                type: "read",

                onRoute: (routeData) => {
                    if (isCancelled) {
                        return;
                    }

                    mergeLeadGeoPoints(leadId, lead, normalizePolylinePoints(routeData?.polyline));
                    markLeadHandled(leadId, "opened");
                },

                onCoordinate: (coords) => {
                    if (isCancelled) {
                        return;
                    }

                    mergeLeadGeoPoints(leadId, lead, normalizeGeoPoints([coords]));
                },

                // Lead has no geo session (created before the geows-v2
                // migration) — not a failure, just nothing to show live.
                onNoSession: () => {
                    if (isCancelled) {
                        return;
                    }

                    setCachedEmptyGeoRoute(leadId);
                    markLeadHandled(leadId, "opened");
                },

                onError: (error) => {
                    if (isCancelled) {
                        return;
                    }

                    deleteCachedGeoRoute(leadId);

                    console.warn("Customer page GeoWS failed:", {
                        leadId,
                        error,
                    });

                    markLeadHandled(leadId, "failed");
                },
            });

            connections.push(connection);
        });

        return () => {
            isCancelled = true;

            connections.forEach((connection) => {
                connection.close();
            });
        };
    }, [leads, leadsKey]);

    return {
        geoRoutes,
        isGeoRoutesLoading,
        geoRoutesError,
    };
}

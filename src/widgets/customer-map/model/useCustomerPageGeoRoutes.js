import { useEffect, useMemo, useState } from "react";

import {
    geoPointToLatLng,
    mergeGeoPointsById,
    openLeadGeoConnection,
} from "../../../utils/geologic";

import {
    deleteCachedGeoRoute,
    getCachedGeoRouteEntry,
    setCachedEmptyGeoRoute,
    setCachedGeoRoute,
} from "./geo-routes-cache";

import {
    notifySuccess,
    notifyWarning,
} from "../../../shared/model/notifications.store";

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

        const openedLeadIds = new Set();
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
                    `Не удалось загрузить GeoWS-маршруты для ${failedCount} из ${leadsWithoutFreshCache.length} лидов`,
                );
            }
        }

        function markLeadHandled(leadId, status) {
            if (handledLeadIds.has(leadId)) {
                return;
            }

            handledLeadIds.add(leadId);

            if (status === "opened") {
                openedLeadIds.add(leadId);
            }

            if (status === "failed") {
                failedLeadIds.add(leadId);
            }

            showGeoRoutesSummaryIfReady();
        }

        leadsWithoutFreshCache.forEach((lead) => {
            const leadId = String(getLeadId(lead));

            const connection = openLeadGeoConnection({
                leadId,
                mode: "read",
                silent: true,

                onOpen: () => {
                    if (isCancelled) {
                        return;
                    }

                    setCachedEmptyGeoRoute(leadId);
                    markLeadHandled(leadId, "opened");
                },

                onPoints: (points) => {
                    if (isCancelled) {
                        return;
                    }

                    setGeoRoutes((prevRoutes) => {
                        const currentRoute = prevRoutes.find(
                            (route) => String(route.id) === leadId,
                        );

                        const mergedPoints = mergeGeoPointsById(
                            currentRoute?.rawPoints || [],
                            points,
                        );

                        if (!mergedPoints.length) {
                            return prevRoutes;
                        }

                        const routePoints =
                            mapGeoPointsToRoutePoints(mergedPoints);
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

                onAuthFailed: (payload) => {
                    if (isCancelled) {
                        return;
                    }

                    deleteCachedGeoRoute(leadId);

                    console.warn("Customer page GeoWS auth failed:", {
                        leadId,
                        payload,
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

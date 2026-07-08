import { useEffect, useMemo, useState } from 'react';

import {
    geoPointToLatLng,
    mergeGeoPointsById,
    openLeadGeoConnection,
} from '../../../utils/geologic';
import {
    notifySuccess,
    notifyWarning,
} from '../../../shared/model/notifications.store';

function getLeadId(lead) {
    return lead?.id || lead?._id || lead?.lead_id || lead?.leadId || '';
}

function buildLeadsKey(leads) {
    return leads
        .map((lead) => getLeadId(lead))
        .filter(Boolean)
        .join('|');
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

        function showGeoRoutesSummaryIfReady() {
            if (isCancelled) {
                return;
            }

            if (handledLeadIds.size < leadsWithId.length) {
                return;
            }

            const openedCount = openedLeadIds.size;
            const failedCount = failedLeadIds.size;
            const totalCount = leadsWithId.length;

            if (openedCount > 0 && failedCount === 0) {
                notifySuccess(
                    `GeoWS-маршруты подключены для ${openedCount} лидов`,
                );
                return;
            }

            if (openedCount > 0 && failedCount > 0) {
                notifyWarning(
                    `GeoWS-маршруты подключены для ${openedCount} из ${totalCount} лидов`,
                );
                return;
            }

            notifyWarning(
                'Не удалось подключить GeoWS-маршруты для текущих лидов',
            );
        }

        function markLeadHandled(leadId, status) {
            if (handledLeadIds.has(leadId)) {
                return;
            }

            handledLeadIds.add(leadId);

            if (status === 'opened') {
                openedLeadIds.add(leadId);
            }

            if (status === 'failed') {
                failedLeadIds.add(leadId);
            }

            showGeoRoutesSummaryIfReady();
        }

        const leadsWithId = leads.filter((lead) => Boolean(getLeadId(lead)));

        if (!leadsWithId.length) {
            setGeoRoutes([]);
            setGeoRoutesError(null);
            setIsGeoRoutesLoading(false);
            return undefined;
        }

        setGeoRoutes([]);
        setGeoRoutesError(null);
        setIsGeoRoutesLoading(true);

        leadsWithId.forEach((lead) => {
            const leadId = String(getLeadId(lead));

            const connection = openLeadGeoConnection({
                leadId,
                mode: 'read',
                silent: true,

                onOpen: () => {
                    if (isCancelled) {
                        return;
                    }

                    markLeadHandled(leadId, 'opened');
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

                        return upsertGeoRoute(prevRoutes, {
                            id: leadId,
                            lead,
                            rawPoints: mergedPoints,
                            points: routePoints,
                            currentPoint,
                        });
                    });
                },

                onError: (error) => {
                    if (isCancelled) {
                        return;
                    }

                    console.warn('Customer page GeoWS failed:', {
                        leadId,
                        error,
                    });

                    markLeadHandled(leadId, 'failed');

                    setGeoRoutesError(
                        `Не удалось загрузить GeoWS-маршруты для ${failedLeadIds.size} из ${leadsWithId.length} лидов`,
                    );
                },

                onAuthFailed: (payload) => {
                    if (isCancelled) {
                        return;
                    }

                    console.warn('Customer page GeoWS auth failed:', {
                        leadId,
                        payload,
                    });

                    markLeadHandled(leadId, 'failed');

                    setGeoRoutesError(
                        `Не удалось авторизовать GeoWS для ${failedLeadIds.size} из ${leadsWithId.length} лидов`,
                    );
                },
            });

            connections.push(connection);
        });

        setIsGeoRoutesLoading(false);

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

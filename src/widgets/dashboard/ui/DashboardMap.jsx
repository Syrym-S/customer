import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import {
    DEFAULT_MAP_CENTER,
    DEFAULT_MAP_ZOOM,
} from '../../../shared/config/map.config';
import { MapView } from '../../../shared/ui/map/MapView';
import { useLeadRoutes } from '../../../features/view-lead-routes/model/useLeadRoutes';
import { useLeadGeoRoutes } from '../../../features/track-lead-location/model/useLeadGeoRoutes';
import { LeadRoutesLayer } from '../../../features/view-lead-routes/ui/LeadRoutesLayer';
import { LeadGeoRoutesLayer } from '../../../features/view-lead-routes/ui/LeadGeoRoutesLayer';

function getRouteBoundsKey(routes) {
    return routes
        .map((route) => route.id)
        .filter(Boolean)
        .sort()
        .join('|');
}

function findRouteByLeadId(routes, leadId) {
    if (!leadId) {
        return null;
    }

    return routes.find((route) => String(route.id) === String(leadId)) || null;
}

export function DashboardMap({
    leads,
    isLoading,
    selectedLeadId,
    highlightedLeadId,
    onSelectLead,
}) {
    const { routes, isRoutesLoading, routesError } = useLeadRoutes(leads);

    const { geoRoutes, isGeoRoutesLoading, geoRoutesError } =
        useLeadGeoRoutes(leads);

    const selectedRoute =
        findRouteByLeadId(routes, selectedLeadId) ||
        findRouteByLeadId(geoRoutes, selectedLeadId);

    const routeBoundsKey = getRouteBoundsKey(routes);
    const geoRouteBoundsKey = getRouteBoundsKey(geoRoutes);

    const leadsBoundsKey = leads
        .map((lead) => lead.id)
        .filter(Boolean)
        .sort()
        .join('|');

    const allRoutesFitBoundsKey =
        routeBoundsKey || geoRouteBoundsKey || leadsBoundsKey;

    const fitBoundsPoints = selectedRoute?.points || [];

    const fitBoundsKey = selectedRoute
        ? `selected-${selectedRoute.id}-${fitBoundsPoints.length}`
        : allRoutesFitBoundsKey;

    const isMapLoading = isLoading || isRoutesLoading || isGeoRoutesLoading;

    const activeHighlightedLeadId = highlightedLeadId || selectedLeadId;

    const hasHighlightedRoute =
        Boolean(activeHighlightedLeadId) &&
        [...routes, ...geoRoutes].some(
            (route) => String(route.id) === String(activeHighlightedLeadId),
        );

    function handleLeadRouteClick(lead) {
        if (!lead?.id) {
            return;
        }

        onSelectLead?.(lead.id);
    }

    return (
        <Box>
            {(routesError || geoRoutesError) && (
                <Alert severity='warning' sx={{ mb: 2 }}>
                    {routesError || geoRoutesError}
                </Alert>
            )}

            <Box
                sx={{
                    position: 'relative',
                    height: {
                        xs: 360,
                        md: 500,
                    },
                    minHeight: 360,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    backgroundColor: 'background.paper',
                    overflow: 'hidden',
                    boxShadow: 2,
                }}
            >
                {isMapLoading && (
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            zIndex: 1000,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1.5,
                            backgroundColor: 'rgba(255, 255, 255, 0.72)',
                            backdropFilter: 'blur(1px)',
                            pointerEvents: 'auto',
                        }}
                    >
                        <CircularProgress size={28} />

                        <Typography
                            color='text.secondary'
                            sx={{
                                fontSize: 13,
                                fontWeight: 500,
                            }}
                        >
                            Загружаем карту...
                        </Typography>
                    </Box>
                )}

                <MapView
                    center={DEFAULT_MAP_CENTER}
                    zoom={DEFAULT_MAP_ZOOM}
                    markers={[]}
                    routes={routes}
                    geoRoutes={geoRoutes}
                    fitBoundsKey={fitBoundsKey}
                    fitBoundsPoints={fitBoundsPoints}
                >
                    <LeadRoutesLayer
                        routes={routes}
                        selectedLeadId={selectedLeadId}
                        activeHighlightedLeadId={activeHighlightedLeadId}
                        hasHighlightedRoute={hasHighlightedRoute}
                        onLeadClick={handleLeadRouteClick}
                    />
                    <LeadGeoRoutesLayer
                        geoRoutes={geoRoutes}
                        selectedLeadId={selectedLeadId}
                        activeHighlightedLeadId={activeHighlightedLeadId}
                        hasHighlightedRoute={hasHighlightedRoute}
                        onLeadClick={handleLeadRouteClick}
                    />{' '}
                </MapView>
            </Box>
        </Box>
    );
}

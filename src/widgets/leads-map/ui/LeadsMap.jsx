import { Alert, Box, CircularProgress, Typography } from '@mui/material';

import { useLeadsContext } from '../../../entities/lead/model/useLeadsContext';
import {
    DEFAULT_MAP_CENTER,
    DEFAULT_MAP_ZOOM,
} from '../../../shared/config/map.config';
import { MapView } from '../../../shared/ui/map/MapView';
import { useLeadRoutes } from '../../../features/view-lead-routes/model/useLeadRoutes';
import { useLeadGeoRoutes } from '../../../features/track-lead-location/model/useLeadGeoRoutes';
import { LeadRoutesLayer } from '../../../features/view-lead-routes/ui/LeadRoutesLayer';
import { LeadGeoRoutesLayer } from '../../../features/view-lead-routes/ui/LeadGeoRoutesLayer';

export function LeadsMap() {
    const { leads, isLoading, openLead, setOpenLead } = useLeadsContext();
    const selectedLeadId = openLead?.id;

    const { routes, isRoutesLoading, routesError } = useLeadRoutes(leads);
    const { geoRoutes, isGeoRoutesLoading, geoRoutesError } =
        useLeadGeoRoutes(leads);

    const routeBoundsKey = routes
        .map((route) => route.id)
        .filter(Boolean)
        .sort()
        .join('|');

    const geoRouteBoundsKey = geoRoutes
        .map((route) => route.id)
        .filter(Boolean)
        .sort()
        .join('|');

    const leadsBoundsKey = leads
        .map((lead) => lead.id)
        .filter(Boolean)
        .sort()
        .join('|');

    const fitBoundsKey = routeBoundsKey || geoRouteBoundsKey || leadsBoundsKey;

    const isMapLoading = isLoading || isRoutesLoading || isGeoRoutesLoading;

    function handleLeadRouteClick(lead) {
        if (!lead) {
            return;
        }

        setOpenLead(lead);
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
                        xs: 320,
                        md: 420,
                    },
                    minHeight: 320,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    backgroundColor: 'background.paper',
                    overflow: 'hidden',
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
                >
                    <LeadRoutesLayer
                        routes={routes}
                        selectedLeadId={selectedLeadId}
                        onLeadClick={handleLeadRouteClick}
                    />

                    <LeadGeoRoutesLayer
                        geoRoutes={geoRoutes}
                        selectedLeadId={selectedLeadId}
                        onLeadClick={handleLeadRouteClick}
                    />
                </MapView>
            </Box>
        </Box>
    );
}

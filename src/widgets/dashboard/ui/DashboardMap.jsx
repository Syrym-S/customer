import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useCustomerMap } from "../../customer-map/model/useCustomerMap";
import { useCustomerPageMapRoutes } from "../../customer-map/model/useCustomerPageMapRoutes";
import { CustomerMapView } from "../../customer-map/ui/CustomerMapView";

function getRouteBoundsKey(routes) {
    return routes
        .map((route) => route.id)
        .filter(Boolean)
        .sort()
        .join("|");
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
    const { t } = useTranslation();

    const map = useCustomerMap();

    const { routes, geoRoutes, isMapRoutesLoading, mapRoutesError } =
        useCustomerPageMapRoutes(leads);

    const selectedRoute =
        findRouteByLeadId(routes, selectedLeadId) ||
        findRouteByLeadId(geoRoutes, selectedLeadId);

    const routeBoundsKey = getRouteBoundsKey(routes);
    const geoRouteBoundsKey = getRouteBoundsKey(geoRoutes);

    const leadsBoundsKey = leads
        .map((lead) => lead.id)
        .filter(Boolean)
        .sort()
        .join("|");

    const allRoutesFitBoundsKey =
        routeBoundsKey || geoRouteBoundsKey || leadsBoundsKey;

    const fitBoundsPoints = selectedRoute?.points || [];

    const fitBoundsKey = selectedRoute
        ? `selected-${selectedRoute.id}-${fitBoundsPoints.length}`
        : allRoutesFitBoundsKey;

    const hasRoutes = routes.length > 0 || geoRoutes.length > 0;
    const isMapLoading = isLoading || isMapRoutesLoading;

    function handleLeadRouteClick(lead) {
        if (!lead?.id) {
            return;
        }

        onSelectLead?.(lead.id);
    }

    return (
        <Box>
            {mapRoutesError && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    {mapRoutesError}
                </Alert>
            )}

            <Box
                sx={{
                    position: "relative",
                    height: {
                        xs: 360,
                        md: 500,
                    },
                    minHeight: 360,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    backgroundColor: "background.paper",
                    boxShadow: 2,
                }}
            >
                {isMapLoading && (
                    <Box
                        sx={{
                            position: "absolute",
                            inset: 0,
                            zIndex: 1000,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1.5,
                            backgroundColor: "rgba(255, 255, 255, 0.72)",
                            backdropFilter: "blur(1px)",
                            pointerEvents: "auto",
                        }}
                    >
                        <CircularProgress size={28} />

                        <Typography
                            color="text.secondary"
                            sx={{
                                fontSize: 13,
                                fontWeight: 500,
                            }}
                        >
                            {t("common.loading.map")}
                        </Typography>
                    </Box>
                )}

                <CustomerMapView
                    center={map.center}
                    zoom={map.zoom}
                    markers={hasRoutes ? [] : map.markers}
                    routePoints={map.routePoints}
                    routes={routes}
                    geoRoutes={geoRoutes}
                    fitBoundsKey={fitBoundsKey}
                    fitBoundsPoints={fitBoundsPoints}
                    borderRadius={2}
                    selectedLeadId={selectedLeadId}
                    highlightedLeadId={highlightedLeadId}
                    handleMarkerClick={map.handleMarkerClick}
                    onLeadClick={handleLeadRouteClick}
                />
            </Box>
        </Box>
    );
}

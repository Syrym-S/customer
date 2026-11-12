import { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, useTheme } from "@mui/material";
import {
   MapContainer,
   AttributionControl,
   TileLayer,
   Marker,
   Popup,
   Tooltip,
} from "react-leaflet";
import PropTypes from "prop-types";
import {
   CUSTOMER_MAP_TILE_LAYER,
   LEAFLET_ATTRIBUTION_PREFIX,
   ROUTE_TOOLTIP_PANE_NAME,
   getDriverIcon,
   getMarkerIcon,
} from "../model/customer-map.constants";
import {
   buildLeadRouteMarkers,
   formatMapLocation,
} from "../model/customer-map.helpers";
import {
   getRoutePathStyle,
   getRouteStatusStyle,
} from "../model/route-status-style";
import { isLeadTrackingActive } from "../../customer-leads/model/lead.helpers";
import { DriverMapInfo } from "./DriverMapInfo";
import { MapResizeHandler } from "./MapResizeHandler";
import { FitRouteBounds } from "./FitRouteBounds";
import { MapClickHandler } from "./MapClickHandler";
import { TooltipEscapePane } from "./TooltipEscapePane";
import { RouteCasingPane } from "./RouteCasingPane";
import { RoutePolyline } from "./RoutePolyline";
import { RouteArrows } from "./RouteArrows";
import { RouteViewModeToggle } from "./RouteViewModeToggle";
import {
   DEFAULT_ROUTE_VIEW_MODE,
   hasPassedRoutePath,
   hasPlannedRoutePath,
   isPassedRouteVisible,
   isPlannedRouteVisible,
   resolveRouteViewFitBoundsPoints,
} from "../model/route-view-mode";

export function CustomerMapView({
   center,
   zoom,
   markers,
   routePoints = [],
   geoRoutePoints = [],
   geoRoutes = [],
   routes = [],
   route = null,
   status,
   fitBoundsKey = "",
   fitBoundsPoints = [],
   selectedLeadId,
   highlightedLeadId,
   borderRadius = 0,
   handleMarkerClick,
   onLeadClick,
   onMapClick,
   onMarkerDragEnd,
}) {
   const { t } = useTranslation();

   const theme = useTheme();
   const [tooltipPaneContainer, setTooltipPaneContainer] = useState(null);
   const [routeViewMode, setRouteViewMode] = useState(DEFAULT_ROUTE_VIEW_MODE);

   const hasPlannedRoute = hasPlannedRoutePath({ routes, routePoints });
   const hasPassedRoute = hasPassedRoutePath({ geoRoutes, geoRoutePoints });

   const canToggleRouteView = hasPlannedRoute && hasPassedRoute;

   const showPlannedRoute =
      !canToggleRouteView || isPlannedRouteVisible(routeViewMode);
   const showPassedRoute =
      !canToggleRouteView || isPassedRouteVisible(routeViewMode);

   const visibleRoutes = showPlannedRoute ? routes : [];
   const visibleRoutePoints = showPlannedRoute ? routePoints : [];
   const visibleGeoRoutes = showPassedRoute ? geoRoutes : [];
   const visibleGeoRoutePoints = showPassedRoute ? geoRoutePoints : [];

   const visibleFitBoundsPoints = resolveRouteViewFitBoundsPoints({
      fitBoundsPoints,
      selectedLeadId,
      visibleRoutes,
      visibleGeoRoutes,
      isFiltered: !showPlannedRoute || !showPassedRoute,
   });

   const routesPointsCount = visibleRoutes.reduce(
      (count, route) => count + (route.points?.length || 0),
      0,
   );

   const geoRoutesPointsCount = visibleGeoRoutes.reduce(
      (count, route) => count + (route.points?.length || 0),
      0,
   );

   const activeHighlightedLeadId = highlightedLeadId || selectedLeadId;

   const hasHighlightedRoute =
      Boolean(activeHighlightedLeadId) &&
      [...routes, ...geoRoutes].some(
         (route) => String(route.id) === String(activeHighlightedLeadId),
      );

   function getRouteViewState(routeId) {
      const isSelected = String(routeId) === String(selectedLeadId);
      const isHighlighted = String(routeId) === String(activeHighlightedLeadId);
      const isDimmed = hasHighlightedRoute && !isHighlighted;

      return {
         isSelected,
         isHighlighted,
         isDimmed,
      };
   }

   const singleRouteStyle = getRoutePathStyle({ status, theme });
   const isGeoOverlaid = showPlannedRoute && showPassedRoute;

   const singleGeoRouteStyle = getRoutePathStyle({
      status,
      theme,
      isGeo: true,
      isGeoOverlaid,
   });
   const singleMarkerColor = getRouteStatusStyle(status, theme).color;

   return (
      <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      <Box sx={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius }}>
      <MapContainer
         center={center}
         zoom={zoom}
         scrollWheelZoom
         attributionControl={false}
         style={{
            width: "100%",
            height: "100%",
         }}
      >
         <RouteCasingPane />

         <TooltipEscapePane container={tooltipPaneContainer} />

         <MapResizeHandler
            center={center}
            zoom={zoom}
            markersCount={markers.length}
            routePointsCount={
               visibleRoutePoints.length +
               visibleGeoRoutePoints.length +
               routesPointsCount +
               geoRoutesPointsCount
            }
         />

         <FitRouteBounds
            routePoints={visibleRoutePoints}
            geoRoutePoints={visibleGeoRoutePoints}
            routes={visibleRoutes}
            geoRoutes={visibleGeoRoutes}
            markers={markers}
            fitBoundsKey={
               fitBoundsKey ? `${fitBoundsKey}|view-${routeViewMode}` : ""
            }
            fitBoundsPoints={visibleFitBoundsPoints}
         />

         <MapClickHandler onMapClick={onMapClick} />

         <AttributionControl prefix={LEAFLET_ATTRIBUTION_PREFIX} />

         <TileLayer
            url={CUSTOMER_MAP_TILE_LAYER.url}
            attribution={CUSTOMER_MAP_TILE_LAYER.attribution}
         />

         {visibleRoutes.map((mapRoute) => {
            if (!mapRoute.points || mapRoute.points.length < 2) {
               return null;
            }

            const { isSelected, isHighlighted, isDimmed } = getRouteViewState(
               mapRoute.id,
            );

            const fromLocation = formatMapLocation(
               mapRoute.lead?.from_location,
               t("route.originNotSpecified"),
            );

            const toLocation = formatMapLocation(
               mapRoute.lead?.to_location,
               t("route.destinationNotSpecified"),
            );

            const routeMarkers = buildLeadRouteMarkers(
               mapRoute.lead,
               mapRoute.points,
            );

            const routeStyle = getRoutePathStyle({
               status: mapRoute.lead?.status,
               theme,
               isSelected,
               isHighlighted,
               isDimmed,
            });

            return (
               <Fragment key={mapRoute.id}>
                  <RoutePolyline
                     positions={mapRoute.points}
                     style={routeStyle}
                     onClick={() => {
                        onLeadClick?.(mapRoute.lead);
                     }}
                  >
                     <Tooltip sticky pane={ROUTE_TOOLTIP_PANE_NAME}>
                        <div>
                           <b>
                              {t("leads.details.number", {
                                 num: mapRoute.lead?.num ?? mapRoute.lead?.id,
                              })}
                           </b>
                           <br />
                           {fromLocation} → {toLocation}
                           <DriverMapInfo driver={mapRoute.lead?.driver} />
                           {mapRoute.route?.distanceMeters && (
                              <>
                                 <br />
                                 {(
                                    mapRoute.route.distanceMeters / 1000
                                 ).toFixed(1)}{" "}
                                 {t("common.units.km")}
                              </>
                           )}
                        </div>
                     </Tooltip>
                  </RoutePolyline>

                  {isHighlighted && (
                     <RouteArrows
                        positions={mapRoute.points}
                        color={routeStyle.path.color}
                     />
                  )}

                  {routeMarkers.map((marker) => (
                     <Marker
                        key={marker.id}
                        position={marker.position}
                        icon={getMarkerIcon(marker, routeStyle.path.color)}
                        opacity={isDimmed ? 0.3 : 1}
                        eventHandlers={{
                           click: () => {
                              onLeadClick?.(mapRoute.lead);
                           },
                        }}
                     >
                        <Popup>
                           <strong>{marker.title}</strong>
                           <br />
                           {t("leads.details.number", {
                              num: mapRoute.lead?.num ?? mapRoute.lead?.id,
                           })}
                           <br />
                           {marker.description}
                        </Popup>
                     </Marker>
                  ))}
               </Fragment>
            );
         })}

         {geoRoutes.map((geoRoute) => {
            const points = geoRoute.points || [];
            const currentPoint = geoRoute.currentPoint;

            if (!points.length) {
               return null;
            }

            const { isSelected, isHighlighted, isDimmed } = getRouteViewState(
               geoRoute.id,
            );

            const geoRouteStyle = getRoutePathStyle({
               status: geoRoute.lead?.status,
               theme,
               isSelected,
               isHighlighted,
               isDimmed,
               isGeo: true,
               isGeoOverlaid,
            });

            return (
               <Fragment key={`geo-${geoRoute.id}`}>
                  {showPassedRoute && points.length >= 2 && (
                     <RoutePolyline
                        positions={points}
                        style={geoRouteStyle}
                        onClick={() => {
                           onLeadClick?.(geoRoute.lead);
                        }}
                     >
                        <Tooltip sticky pane={ROUTE_TOOLTIP_PANE_NAME}>
                           <div>
                              <b>
                                 {t("map.actualPathOrder")}
                                 {geoRoute.lead?.num ?? geoRoute.lead?.id}
                              </b>
                              <br />
                              {formatMapLocation(
                                 geoRoute.lead?.from_location,
                                 t("route.originNotSpecified"),
                              )}{" "}
                              →{" "}
                              {formatMapLocation(
                                 geoRoute.lead?.to_location,
                                 t("route.destinationNotSpecified"),
                              )}
                              <DriverMapInfo driver={geoRoute.lead?.driver} />
                              <br />
                              {t("map.pointsCount", { count: points.length })}
                           </div>
                        </Tooltip>
                     </RoutePolyline>
                  )}

                  {currentPoint && isLeadTrackingActive(geoRoute.lead?.status) && (
                     <Marker
                        position={currentPoint}
                        icon={getDriverIcon(geoRoute.driverFacing)}
                        opacity={isDimmed ? 0.3 : 1}
                        eventHandlers={{
                           click: () => {
                              onLeadClick?.(geoRoute.lead);
                           },
                        }}
                     >
                        <Popup>
                           <strong>{t("map.driverPosition")}</strong>
                           <br />
                        </Popup>
                     </Marker>
                  )}
               </Fragment>
            );
         })}

         {visibleRoutePoints.length >= 2 && (
            <>
               <RoutePolyline
                  positions={visibleRoutePoints}
                  style={singleRouteStyle}
               >
                  <Tooltip sticky pane={ROUTE_TOOLTIP_PANE_NAME}>
                     <div>
                        <b>{t("common.fields.route")}</b>

                        {route?.distanceMeters && (
                           <>
                              <br />
                              {(route.distanceMeters / 1000).toFixed(1)}{" "}
                              {t("common.units.km")}
                           </>
                        )}

                        {route?.duration && (
                           <>
                              <br />
                              {t("chat.time.minutes", {
                                 count: Math.round(
                                    parseInt(route.duration, 10) / 60,
                                 ),
                              })}
                           </>
                        )}
                     </div>
                  </Tooltip>
               </RoutePolyline>

               <RouteArrows
                  positions={visibleRoutePoints}
                  color={singleRouteStyle.path.color}
               />
            </>
         )}

         {visibleGeoRoutePoints.length >= 2 && (
            <RoutePolyline
               positions={visibleGeoRoutePoints}
               style={singleGeoRouteStyle}
            >
               <Tooltip sticky pane={ROUTE_TOOLTIP_PANE_NAME}>
                  <div>
                     <b>{t("map.actualPath")}</b>
                     <br />
                     {t("map.pointsCount", {
                        count: visibleGeoRoutePoints.length,
                     })}
                  </div>
               </Tooltip>
            </RoutePolyline>
         )}

         {markers.map((marker) => (
            <Marker
               key={marker.id}
               position={marker.position}
               icon={getMarkerIcon(marker, singleMarkerColor)}
               draggable={Boolean(marker.draggable)}
               eventHandlers={{
                  click: () => handleMarkerClick?.(marker),
                  dragend: (event) => {
                     if (!onMarkerDragEnd) {
                        return;
                     }

                     const position = event.target.getLatLng();

                     onMarkerDragEnd(marker, position);
                  },
               }}
            >
               <Popup>
                  <strong>{marker.title}</strong>
                  <br />
                  {marker.description}
               </Popup>
            </Marker>
         ))}
      </MapContainer>
      </Box>

      {canToggleRouteView && (
         <RouteViewModeToggle
            value={routeViewMode}
            onChange={setRouteViewMode}
         />
      )}

      <Box
         ref={setTooltipPaneContainer}
         className="route-tooltip-pane"
         sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      />
      </Box>
   );
}

CustomerMapView.propTypes = {
   center: PropTypes.array.isRequired,
   zoom: PropTypes.number.isRequired,
   markers: PropTypes.array.isRequired,
   borderRadius: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
   routePoints: PropTypes.array,
   geoRoutePoints: PropTypes.array,
   geoRoutes: PropTypes.array,
   route: PropTypes.object,
   routes: PropTypes.array,
   status: PropTypes.string,
   handleMarkerClick: PropTypes.func.isRequired,
   onMapClick: PropTypes.func,
   onMarkerDragEnd: PropTypes.func,
   fitBoundsKey: PropTypes.string,
   onLeadClick: PropTypes.func,
   fitBoundsPoints: PropTypes.array,
   selectedLeadId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
   highlightedLeadId: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
   ]),
};

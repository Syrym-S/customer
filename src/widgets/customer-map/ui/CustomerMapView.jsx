import { Fragment, useState } from "react";
import { Box, useTheme } from "@mui/material";
import {
   MapContainer,
   TileLayer,
   Marker,
   Popup,
   Tooltip,
} from "react-leaflet";
import PropTypes from "prop-types";
import {
   CUSTOMER_MAP_TILE_LAYER,
   ROUTE_TOOLTIP_PANE_NAME,
   driverIcon,
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
import { DriverMapInfo } from "./DriverMapInfo";
import { MapResizeHandler } from "./MapResizeHandler";
import { FitRouteBounds } from "./FitRouteBounds";
import { MapClickHandler } from "./MapClickHandler";
import { TooltipEscapePane } from "./TooltipEscapePane";
import { RouteCasingPane } from "./RouteCasingPane";
import { RoutePolyline } from "./RoutePolyline";
import { RouteArrows } from "./RouteArrows";

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
   const theme = useTheme();
   const [tooltipPaneContainer, setTooltipPaneContainer] = useState(null);

   const routesPointsCount = routes.reduce(
      (count, route) => count + (route.points?.length || 0),
      0,
   );

   const geoRoutesPointsCount = geoRoutes.reduce(
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
   const singleGeoRouteStyle = getRoutePathStyle({
      status,
      theme,
      isGeo: true,
   });
   const singleMarkerColor = getRouteStatusStyle(status, theme).color;

   return (
      <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      <Box sx={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius }}>
      <MapContainer
         center={center}
         zoom={zoom}
         scrollWheelZoom
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
               routePoints.length +
               geoRoutePoints.length +
               routesPointsCount +
               geoRoutesPointsCount
            }
         />

         <FitRouteBounds
            routePoints={routePoints}
            geoRoutePoints={geoRoutePoints}
            routes={routes}
            geoRoutes={geoRoutes}
            markers={markers}
            fitBoundsKey={fitBoundsKey}
            fitBoundsPoints={fitBoundsPoints}
         />

         <MapClickHandler onMapClick={onMapClick} />

         <TileLayer
            attribution={CUSTOMER_MAP_TILE_LAYER.attribution}
            url={CUSTOMER_MAP_TILE_LAYER.url}
         />

         {routes.map((mapRoute) => {
            if (!mapRoute.points || mapRoute.points.length < 2) {
               return null;
            }

            const { isSelected, isHighlighted, isDimmed } = getRouteViewState(
               mapRoute.id,
            );

            const fromLocation = formatMapLocation(
               mapRoute.lead?.from_location,
               "Откуда не указано",
            );

            const toLocation = formatMapLocation(
               mapRoute.lead?.to_location,
               "Куда не указано",
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
                           <b>Заказ #{mapRoute.lead?.num ?? mapRoute.lead?.id}</b>
                           <br />
                           {fromLocation} → {toLocation}
                           <DriverMapInfo driver={mapRoute.lead?.driver} />
                           {mapRoute.route?.distanceMeters && (
                              <>
                                 <br />
                                 {(
                                    mapRoute.route.distanceMeters / 1000
                                 ).toFixed(1)}{" "}
                                 км
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
                           Заказ #{mapRoute.lead?.num ?? mapRoute.lead?.id}
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
            });

            return (
               <Fragment key={`geo-${geoRoute.id}`}>
                  {points.length >= 2 && (
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
                                 Фактический путь заказа #
                                 {geoRoute.lead?.num ?? geoRoute.lead?.id}
                              </b>
                              <br />
                              {formatMapLocation(
                                 geoRoute.lead?.from_location,
                                 "Откуда не указано",
                              )}{" "}
                              →{" "}
                              {formatMapLocation(
                                 geoRoute.lead?.to_location,
                                 "Куда не указано",
                              )}
                              <DriverMapInfo driver={geoRoute.lead?.driver} />
                              <br />
                              Точек: {points.length}
                           </div>
                        </Tooltip>
                     </RoutePolyline>
                  )}

                  {currentPoint && (
                     <Marker
                        position={currentPoint}
                        icon={driverIcon}
                        opacity={isDimmed ? 0.3 : 1}
                        eventHandlers={{
                           click: () => {
                              onLeadClick?.(geoRoute.lead);
                           },
                        }}
                     >
                        <Popup>
                           <strong>Текущая позиция водителя</strong>
                           <br />
                        </Popup>
                     </Marker>
                  )}
               </Fragment>
            );
         })}

         {routePoints.length >= 2 && (
            <>
               <RoutePolyline positions={routePoints} style={singleRouteStyle}>
                  <Tooltip sticky pane={ROUTE_TOOLTIP_PANE_NAME}>
                     <div>
                        <b>Маршрут</b>

                        {route?.distanceMeters && (
                           <>
                              <br />
                              {(route.distanceMeters / 1000).toFixed(1)} км
                           </>
                        )}

                        {route?.duration && (
                           <>
                              <br />
                              {Math.round(parseInt(route.duration, 10) / 60)} мин
                           </>
                        )}
                     </div>
                  </Tooltip>
               </RoutePolyline>

               <RouteArrows
                  positions={routePoints}
                  color={singleRouteStyle.path.color}
               />
            </>
         )}

         {geoRoutePoints.length >= 2 && (
            <RoutePolyline
               positions={geoRoutePoints}
               style={singleGeoRouteStyle}
            >
               <Tooltip sticky pane={ROUTE_TOOLTIP_PANE_NAME}>
                  <div>
                     <b>Фактический путь</b>
                     <br />
                     Точек: {geoRoutePoints.length}
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
};

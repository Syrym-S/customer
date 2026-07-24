import { Fragment } from "react";
import {
   MapContainer,
   TileLayer,
   Marker,
   Popup,
   Polyline,
   Tooltip,
} from "react-leaflet";
import PropTypes from "prop-types";
import {
   CUSTOMER_MAP_TILE_LAYER,
   driverIcon,
} from "../model/customer-map.constants";
import {
   buildLeadRouteMarkers,
   formatMapLocation,
} from "../model/customer-map.helpers";
import { DriverMapInfo } from "./DriverMapInfo";
import { MapResizeHandler } from "./MapResizeHandler";
import { FitRouteBounds } from "./FitRouteBounds";
import { MapClickHandler } from "./MapClickHandler";

export function CustomerMapView({
   center,
   zoom,
   markers,
   routePoints = [],
   geoRoutePoints = [],
   geoRoutes = [],
   routes = [],
   route = null,
   fitBoundsKey = "",
   fitBoundsPoints = [],
   selectedLeadId,
   highlightedLeadId,
   handleMarkerClick,
   onLeadClick,
   onMapClick,
   onMarkerDragEnd,
}) {
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

   return (
      <MapContainer
         center={center}
         zoom={zoom}
         scrollWheelZoom
         style={{
            width: "100%",
            height: "100%",
         }}
      >
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

         {routes.map((mapRoute, index) => {
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

            return (
               <Fragment key={mapRoute.id}>
                  <Polyline
                     positions={mapRoute.points}
                     pathOptions={{
                        weight: isSelected
                           ? 7
                           : isHighlighted
                             ? 6
                             : index === 0
                               ? 5
                               : 4,
                        opacity: isDimmed
                           ? 0.18
                           : isHighlighted
                             ? 0.95
                             : index === 0
                               ? 0.9
                               : 0.65,
                     }}
                     eventHandlers={{
                        click: () => {
                           onLeadClick?.(mapRoute.lead);
                        },
                     }}
                  >
                     <Tooltip sticky>
                        <div>
                           <b>Лид #{mapRoute.lead?.num ?? mapRoute.lead?.id}</b>
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
                  </Polyline>

                  {routeMarkers.map((marker) => (
                     <Marker
                        key={marker.id}
                        position={marker.position}
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
                           Лид #{mapRoute.lead?.num ?? mapRoute.lead?.id}
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

            return (
               <Fragment key={`geo-${geoRoute.id}`}>
                  {points.length >= 2 && (
                     <Polyline
                        positions={points}
                        pathOptions={{
                           weight: isSelected ? 7 : isHighlighted ? 6 : 4,
                           opacity: isDimmed ? 0.18 : 0.95,
                           dashArray: "8 8",
                        }}
                        eventHandlers={{
                           click: () => {
                              onLeadClick?.(geoRoute.lead);
                           },
                        }}
                     >
                        <Tooltip sticky>
                           <div>
                              <b>
                                 Фактический путь лида #
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
                     </Polyline>
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
            <Polyline
               positions={routePoints}
               pathOptions={{
                  weight: 5,
                  opacity: 0.9,
               }}
            >
               <Tooltip sticky>
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
            </Polyline>
         )}

         {geoRoutePoints.length >= 2 && (
            <Polyline
               positions={geoRoutePoints}
               pathOptions={{
                  weight: 4,
                  opacity: 0.95,
                  dashArray: "8 8",
               }}
            >
               <Tooltip sticky>
                  <div>
                     <b>Фактический путь</b>
                     <br />
                     Точек: {geoRoutePoints.length}
                  </div>
               </Tooltip>
            </Polyline>
         )}

         {markers.map((marker) => {
            const markerProps =
               marker.id === "geo-current-point" ? { icon: driverIcon } : {};

            return (
               <Marker
                  key={marker.id}
                  position={marker.position}
                  draggable={Boolean(marker.draggable)}
                  {...markerProps}
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
            );
         })}
      </MapContainer>
   );
}

CustomerMapView.propTypes = {
   center: PropTypes.array.isRequired,
   zoom: PropTypes.number.isRequired,
   markers: PropTypes.array.isRequired,
   routePoints: PropTypes.array,
   geoRoutePoints: PropTypes.array,
   geoRoutes: PropTypes.array,
   route: PropTypes.object,
   routes: PropTypes.array,
   handleMarkerClick: PropTypes.func.isRequired,
   onMapClick: PropTypes.func,
   onMarkerDragEnd: PropTypes.func,
   fitBoundsKey: PropTypes.string,
   onLeadClick: PropTypes.func,
   fitBoundsPoints: PropTypes.array,
};

import { Fragment, useEffect, useRef } from 'react';
import {
   MapContainer,
   TileLayer,
   Marker,
   Popup,
   useMapEvents,
   Polyline,
   useMap,
   Tooltip,
} from 'react-leaflet';
import PropTypes from 'prop-types';
import L from 'leaflet';
import { normalizeLocationValue } from '../../customer-leads/model/lead-edit-form.helpers';

const driverIcon = L.divIcon({
   className: 'driver-marker',
   html: '<div class="driver-marker__icon">🚚</div>',
   iconSize: [38, 38],
   iconAnchor: [19, 19],
   popupAnchor: [0, -18],
});

function formatMapLocation(value, fallback) {
   return normalizeLocationValue(value) || fallback;
}

function formatDriverName(driver) {
   return (
      driver?.fio ||
      driver?.name ||
      driver?.fullName ||
      driver?.full_name ||
      'Водитель не указан'
   );
}

function formatDriverPhone(driver) {
   return driver?.phone || driver?.tel || driver?.telephone || '';
}

function normalizePhoneHref(phone) {
   if (!phone) {
      return '';
   }

   const normalizedPhone = String(phone).replace(/[^\d+]/g, '');

   if (!normalizedPhone) {
      return '';
   }

   return normalizedPhone.startsWith('+')
      ? normalizedPhone
      : `+${normalizedPhone}`;
}

function DriverMapInfo({ driver }) {
   const driverName = formatDriverName(driver);
   const driverPhone = formatDriverPhone(driver);
   const driverPhoneHref = normalizePhoneHref(driverPhone);

   return (
      <>
         <br />
         Водитель: {driverName}
         {driverPhone && (
            <>
               <br />
               Телефон:{' '}
               {driverPhoneHref ? (
                  <a href={`tel:${driverPhoneHref}`}>{driverPhone}</a>
               ) : (
                  driverPhone
               )}
            </>
         )}
      </>
   );
}

export function CustomerMapView({
   center,
   zoom,
   markers,
   routePoints = [],
   geoRoutePoints = [],
   geoRoutes = [],
   routes = [],
   route = null,
   fitBoundsKey = '',
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

   return (
      <MapContainer
         center={center}
         zoom={zoom}
         scrollWheelZoom
         style={{
            width: '100%',
            height: '100%',
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
            fitBoundsKey={fitBoundsKey}
         />

         <MapClickHandler onMapClick={onMapClick} />

         <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url='https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
         />

         {routes.map((mapRoute, index) => {
            if (!mapRoute.points || mapRoute.points.length < 2) {
               return null;
            }

            const startPoint = mapRoute.points[0];
            const endPoint = mapRoute.points[mapRoute.points.length - 1];

            const fromLocation = formatMapLocation(
               mapRoute.lead?.from_location,
               'Откуда не указано',
            );

            const toLocation = formatMapLocation(
               mapRoute.lead?.to_location,
               'Куда не указано',
            );

            return (
               <Fragment key={mapRoute.id}>
                  <Polyline
                     positions={mapRoute.points}
                     pathOptions={{
                        weight: index === 0 ? 5 : 4,
                        opacity: index === 0 ? 0.9 : 0.65,
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
                                 ).toFixed(1)}{' '}
                                 км
                              </>
                           )}
                        </div>
                     </Tooltip>
                  </Polyline>

                  <Marker position={startPoint}>
                     <Popup>
                        <strong>Точка А</strong>
                        <br />
                        Лид #{mapRoute.lead?.num ?? mapRoute.lead?.id}
                        <br />
                        {fromLocation}
                     </Popup>
                  </Marker>

                  <Marker position={endPoint}>
                     <Popup>
                        <strong>Точка Б</strong>
                        <br />
                        Лид #{mapRoute.lead?.num ?? mapRoute.lead?.id}
                        <br />
                        {toLocation}
                     </Popup>
                  </Marker>
               </Fragment>
            );
         })}

         {geoRoutes.map((geoRoute) => {
            const points = geoRoute.points || [];
            const currentPoint = geoRoute.currentPoint;

            if (!points.length) {
               return null;
            }

            return (
               <Fragment key={`geo-${geoRoute.id}`}>
                  {points.length >= 2 && (
                     <Polyline
                        positions={points}
                        pathOptions={{
                           weight: 4,
                           opacity: 0.95,
                           dashArray: '8 8',
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
                                 'Откуда не указано',
                              )}{' '}
                              →{' '}
                              {formatMapLocation(
                                 geoRoute.lead?.to_location,
                                 'Куда не указано',
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
                  dashArray: '8 8',
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
               marker.id === 'geo-current-point' ? { icon: driverIcon } : {};

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

function MapResizeHandler({ center, zoom, markersCount, routePointsCount }) {
   const map = useMap();

   useEffect(() => {
      const invalidate = () => {
         map.invalidateSize();
      };

      const firstTimeoutId = setTimeout(invalidate, 0);
      const secondTimeoutId = setTimeout(invalidate, 250);
      const thirdTimeoutId = setTimeout(invalidate, 600);

      return () => {
         clearTimeout(firstTimeoutId);
         clearTimeout(secondTimeoutId);
         clearTimeout(thirdTimeoutId);
      };
   }, [map, center, zoom, markersCount, routePointsCount]);

   useEffect(() => {
      const container = map.getContainer();

      const resizeObserver = new ResizeObserver(() => {
         map.invalidateSize();
      });

      resizeObserver.observe(container);

      return () => {
         resizeObserver.disconnect();
      };
   }, [map]);

   return null;
}

function FitRouteBounds({
   routePoints,
   geoRoutePoints,
   routes,
   geoRoutes,
   fitBoundsKey,
}) {
   const map = useMap();
   const fittedBoundsKeyRef = useRef(null);

   useEffect(() => {
      if (!fitBoundsKey) {
         return;
      }

      if (fittedBoundsKeyRef.current === fitBoundsKey) {
         return;
      }

      const routesPoints = routes.flatMap((route) => route.points || []);
      const geoRoutesPoints = geoRoutes.flatMap((route) => route.points || []);

      const points = [
         ...routesPoints,
         ...geoRoutesPoints,
         ...routePoints,
         ...geoRoutePoints,
      ];

      if (!points || points.length < 2) {
         return;
      }

      map.fitBounds(points, {
         padding: [32, 32],
      });

      fittedBoundsKeyRef.current = fitBoundsKey;
   }, [map, fitBoundsKey, routePoints, geoRoutePoints, routes, geoRoutes]);

   return null;
}

function MapClickHandler({ onMapClick }) {
   useMapEvents({
      click(event) {
         if (!onMapClick) {
            return;
         }

         onMapClick(event.latlng);
      },
   });

   return null;
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
};

MapResizeHandler.propTypes = {
   center: PropTypes.array.isRequired,
   zoom: PropTypes.number.isRequired,
   markersCount: PropTypes.number.isRequired,
   routePointsCount: PropTypes.number.isRequired,
};

FitRouteBounds.propTypes = {
   routePoints: PropTypes.array,
   geoRoutePoints: PropTypes.array,
   routes: PropTypes.array,
   geoRoutes: PropTypes.array,
   fitBoundsKey: PropTypes.string,
};

MapClickHandler.propTypes = {
   onMapClick: PropTypes.func,
};

DriverMapInfo.propTypes = {
   driver: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      fio: PropTypes.string,
      name: PropTypes.string,
      fullName: PropTypes.string,
      full_name: PropTypes.string,
      phone: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      tel: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      telephone: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
   }),
};

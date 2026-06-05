import { useEffect } from 'react';
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

export function CustomerMapView({
   center,
   zoom,
   markers,
   routePoints = [],
   routes = [],
   handleMarkerClick,
   onMapClick,
   onMarkerDragEnd,
}) {
   const routesPointsCount = routes.reduce(
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
            routePointsCount={routePoints.length + routesPointsCount}
         />

         <FitRouteBounds routePoints={routePoints} routes={routes} />

         <MapClickHandler onMapClick={onMapClick} />

         <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url='https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
         />

         {routes.map((mapRoute, index) => {
            if (!mapRoute.points || mapRoute.points.length < 2) {
               return null;
            }

            return (
               <Polyline
                  key={mapRoute.id}
                  positions={mapRoute.points}
                  pathOptions={{
                     weight: index === 0 ? 5 : 4,
                     opacity: index === 0 ? 0.9 : 0.65,
                  }}
               >
                  <Tooltip sticky>
                     <div>
                        <b>Лид #{mapRoute.lead?.num ?? mapRoute.lead?.id}</b>
                        <br />
                        {mapRoute.lead?.from_location} →{' '}
                        {mapRoute.lead?.to_location}
                        {mapRoute.route?.distanceMeters && (
                           <>
                              <br />
                              {(mapRoute.route.distanceMeters / 1000).toFixed(
                                 1,
                              )}{' '}
                              км
                           </>
                        )}
                     </div>
                  </Tooltip>
               </Polyline>
            );
         })}

         {routePoints.length >= 2 && (
            <Polyline
               positions={routePoints}
               pathOptions={{
                  weight: 5,
                  opacity: 0.9,
               }}
            />
         )}

         {markers.map((marker) => (
            <Marker
               key={marker.id}
               position={marker.position}
               draggable={Boolean(marker.draggable)}
               eventHandlers={{
                  click: () => handleMarkerClick(marker),
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

function FitRouteBounds({ routePoints, routes }) {
   const map = useMap();

   useEffect(() => {
      const routesPoints = routes.flatMap((route) => route.points || []);

      const points = routesPoints.length >= 2 ? routesPoints : routePoints;

      if (!points || points.length < 2) {
         return;
      }

      map.fitBounds(points, {
         padding: [32, 32],
      });
   }, [map, routePoints, routes]);

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
   routes: PropTypes.array,
   handleMarkerClick: PropTypes.func.isRequired,
   onMapClick: PropTypes.func,
   onMarkerDragEnd: PropTypes.func,
};

MapResizeHandler.propTypes = {
   center: PropTypes.array.isRequired,
   zoom: PropTypes.number.isRequired,
   markersCount: PropTypes.number.isRequired,
   routePointsCount: PropTypes.number.isRequired,
};

FitRouteBounds.propTypes = {
   routePoints: PropTypes.array,
   routes: PropTypes.array,
};

MapClickHandler.propTypes = {
   onMapClick: PropTypes.func,
};

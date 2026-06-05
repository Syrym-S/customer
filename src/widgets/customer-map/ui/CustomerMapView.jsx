import { useEffect } from 'react';
import {
   MapContainer,
   TileLayer,
   Marker,
   Popup,
   useMapEvents,
   Polyline,
   useMap,
} from 'react-leaflet';
import PropTypes from 'prop-types';

export function CustomerMapView({
   center,
   zoom,
   markers,
   routePoints = [],
   handleMarkerClick,
   onMapClick,
   onMarkerDragEnd,
}) {
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
            routePointsCount={routePoints.length}
         />

         <FitRouteBounds routePoints={routePoints} />

         <MapClickHandler onMapClick={onMapClick} />

         <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url='https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
         />

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

function FitRouteBounds({ routePoints }) {
   const map = useMap();

   useEffect(() => {
      if (!routePoints || routePoints.length < 2) {
         return;
      }

      map.fitBounds(routePoints, {
         padding: [32, 32],
      });
   }, [map, routePoints]);

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
};

MapClickHandler.propTypes = {
   onMapClick: PropTypes.func,
};

import {
   MapContainer,
   TileLayer,
   Marker,
   Popup,
   useMapEvents,
   Polyline,
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
         <MapClickHandler onMapClick={onMapClick} />

         <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url='https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
         />

         {routePoints.length >= 2 && (
            <Polyline
               positions={routePoints}
               pathOptions={{
                  weight: 4,
                  opacity: 0.8,
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

MapClickHandler.propTypes = {
   onMapClick: PropTypes.func,
};

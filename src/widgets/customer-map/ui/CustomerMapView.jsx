import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import PropTypes from 'prop-types';

export function CustomerMapView({ center, zoom, markers, handleMarkerClick }) {
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
         <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url='https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
         />

         {markers.map((marker) => (
            <Marker
               key={marker.id}
               position={marker.position}
               eventHandlers={{
                  click: () => handleMarkerClick(marker),
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

CustomerMapView.propTypes = {
   center: PropTypes.arrayOf(PropTypes.number).isRequired,

   zoom: PropTypes.number.isRequired,

   markers: PropTypes.arrayOf(
      PropTypes.shape({
         id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
            .isRequired,
         title: PropTypes.string.isRequired,
         description: PropTypes.string,
         position: PropTypes.arrayOf(PropTypes.number).isRequired,
      }),
   ).isRequired,

   handleMarkerClick: PropTypes.func.isRequired,
};

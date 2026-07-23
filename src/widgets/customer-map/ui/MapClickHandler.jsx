import PropTypes from 'prop-types';
import { useMapEvents } from 'react-leaflet';

export function MapClickHandler({ onMapClick }) {
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

MapClickHandler.propTypes = {
   onMapClick: PropTypes.func,
};

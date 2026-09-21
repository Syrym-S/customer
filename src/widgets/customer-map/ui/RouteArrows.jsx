import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Marker, useMap, useMapEvents } from 'react-leaflet';
import { getArrowIcon } from '../model/customer-map.constants';
import { buildArrowPlacements } from '../model/route-arrows.helpers';

export function RouteArrows({ positions, color }) {
   const map = useMap();
   const [zoom, setZoom] = useState(() => map.getZoom());

   useMapEvents({
      zoomend: () => setZoom(map.getZoom()),
   });

   const arrows = useMemo(
      () => buildArrowPlacements(map, positions, zoom),
      [map, positions, zoom],
   );

   return arrows.map((arrow, index) => (
      <Marker
         key={index}
         position={arrow.position}
         icon={getArrowIcon(color, arrow.angle)}
         interactive={false}
         keyboard={false}
         zIndexOffset={-1000}
      />
   ));
}

RouteArrows.propTypes = {
   positions: PropTypes.array.isRequired,
   color: PropTypes.string.isRequired,
};

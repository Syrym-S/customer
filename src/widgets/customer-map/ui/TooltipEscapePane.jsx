import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useMap } from 'react-leaflet';
import { ROUTE_TOOLTIP_PANE_NAME } from '../model/customer-map.constants';

export function TooltipEscapePane({ container }) {
   const map = useMap();

   useEffect(() => {
      if (!container || map.getPane(ROUTE_TOOLTIP_PANE_NAME)) {
         return;
      }

      const pane = map.createPane(ROUTE_TOOLTIP_PANE_NAME, container);

      pane.style.zIndex = 1000;
      pane.style.pointerEvents = 'none';
   }, [map, container]);

   return null;
}

TooltipEscapePane.propTypes = {
   container: PropTypes.instanceOf(Element),
};

import { useEffect } from 'react';
import L from 'leaflet';
import PropTypes from 'prop-types';
import { useMap } from 'react-leaflet';
import { ROUTE_TOOLTIP_PANE_NAME } from '../model/customer-map.constants';

const SYNC_EVENTS = 'move viewreset zoomend';

export function TooltipEscapePane({ container }) {
   const map = useMap();

   useEffect(() => {
      if (!container) {
         return undefined;
      }

      const pane =
         map.getPane(ROUTE_TOOLTIP_PANE_NAME) ||
         map.createPane(ROUTE_TOOLTIP_PANE_NAME, container);

      pane.style.zIndex = 1000;
      pane.style.pointerEvents = 'none';

      const mapPane = map.getPane('mapPane');

      function syncPanePosition() {
         L.DomUtil.setPosition(
            pane,
            L.DomUtil.getPosition(mapPane) || L.point(0, 0),
         );
      }

      syncPanePosition();
      map.on(SYNC_EVENTS, syncPanePosition);

      return () => {
         map.off(SYNC_EVENTS, syncPanePosition);
      };
   }, [map, container]);

   return null;
}

TooltipEscapePane.propTypes = {
   container: PropTypes.instanceOf(Element),
};

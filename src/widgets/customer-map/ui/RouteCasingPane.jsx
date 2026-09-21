import { useLayoutEffect } from 'react';
import { useMap } from 'react-leaflet';
import { ROUTE_CASING_PANE_NAME } from '../model/customer-map.constants';

export function RouteCasingPane() {
   const map = useMap();

   useLayoutEffect(() => {
      if (map.getPane(ROUTE_CASING_PANE_NAME)) {
         return;
      }

      const pane = map.createPane(ROUTE_CASING_PANE_NAME);

      pane.style.zIndex = 390;
      pane.style.pointerEvents = 'none';
   }, [map]);

   return null;
}

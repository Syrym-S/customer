import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export function MapResizeHandler({
   center,
   zoom,
   markersCount,
   routePointsCount,
}) {
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


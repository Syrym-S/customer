import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import {
   buildFitBoundsKey,
   buildFitBoundsPoints,
} from '../model/customer-map.helpers';

export function FitRouteBounds({
   routePoints,
   geoRoutePoints,
   routes,
   geoRoutes,
   markers = [],
   fitBoundsKey,
   fitBoundsPoints = [],
}) {
   const map = useMap();
   const fittedBoundsKeyRef = useRef(null);

   useEffect(() => {
      const points = buildFitBoundsPoints({
         fitBoundsPoints,
         routes,
         geoRoutes,
         routePoints,
         geoRoutePoints,
         markers,
      });

      if (points.length < 2) {
         return;
      }

      const actualBoundsKey = fitBoundsKey || buildFitBoundsKey(points);

      if (!actualBoundsKey) {
         return;
      }

      const bounds = L.latLngBounds(points);

      const fitBounds = () => {
         map.invalidateSize();

         map.fitBounds(bounds, {
            padding: [32, 32],
            maxZoom: 12,
            animate: false,
         });

         fittedBoundsKeyRef.current = actualBoundsKey;
      };

      const timeoutIds = [
         setTimeout(fitBounds, 0),
         setTimeout(fitBounds, 250),
         setTimeout(fitBounds, 600),
         setTimeout(fitBounds, 1000),
      ];

      return () => {
         timeoutIds.forEach(clearTimeout);
      };
   }, [map, fitBoundsKey, fitBoundsPoints]);

   return null;
}

FitRouteBounds.propTypes = {
   routePoints: PropTypes.array,
   geoRoutePoints: PropTypes.array,
   routes: PropTypes.array,
   geoRoutes: PropTypes.array,
   markers: PropTypes.array,
   fitBoundsKey: PropTypes.string,
   fitBoundsPoints: PropTypes.array,
};

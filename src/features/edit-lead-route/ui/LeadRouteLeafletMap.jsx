import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
   iconRetinaUrl: markerIcon2x,
   iconUrl: markerIcon,
   shadowUrl: markerShadow,
});

export function LeadRouteLeafletMap({
   center,
   zoom,
   routePoints = [],
   fromLabel = 'Откуда',
   toLabel = 'Куда',
}) {
   const containerRef = useRef(null);
   const mapRef = useRef(null);
   const polylineRef = useRef(null);
   const markersRef = useRef([]);

   useEffect(() => {
      if (!containerRef.current || mapRef.current) {
         return;
      }

      mapRef.current = L.map(containerRef.current, {
         zoomControl: true,
      }).setView(center, zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
         attribution: '© OpenStreetMap contributors',
      }).addTo(mapRef.current);

      setTimeout(() => {
         mapRef.current?.invalidateSize();
      }, 100);
   }, [center, zoom]);

   useEffect(() => {
      if (!mapRef.current) {
         return;
      }

      polylineRef.current?.remove();
      polylineRef.current = null;

      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      if (!routePoints || routePoints.length < 2) {
         mapRef.current.setView(center, zoom);
         mapRef.current.invalidateSize();
         return;
      }

      polylineRef.current = L.polyline(routePoints, {
         color: '#1e88e5',
         weight: 5,
         opacity: 0.9,
      }).addTo(mapRef.current);

      const startPoint = routePoints[0];
      const endPoint = routePoints[routePoints.length - 1];

      const startMarker = L.marker(startPoint)
         .addTo(mapRef.current)
         .bindPopup(fromLabel);

      const endMarker = L.marker(endPoint)
         .addTo(mapRef.current)
         .bindPopup(toLabel);

      markersRef.current = [startMarker, endMarker];

      mapRef.current.fitBounds(polylineRef.current.getBounds(), {
         padding: [24, 24],
      });

      setTimeout(() => {
         mapRef.current?.invalidateSize();
      }, 100);
   }, [routePoints, center, zoom, fromLabel, toLabel]);

   useEffect(() => {
      return () => {
         polylineRef.current?.remove();

         markersRef.current.forEach((marker) => marker.remove());
         markersRef.current = [];

         if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
         }
      };
   }, []);

   return (
      <Box
         ref={containerRef}
         sx={{
            width: '100%',
            height: '100%',
         }}
      />
   );
}

LeadRouteLeafletMap.propTypes = {
   center: PropTypes.array.isRequired,
   zoom: PropTypes.number.isRequired,
   routePoints: PropTypes.array,
   fromLabel: PropTypes.string,
   toLabel: PropTypes.string,
};

import PropTypes from 'prop-types';
import { Box, CircularProgress } from '@mui/material';

import { CustomerMapView } from '../../../customer-map/ui/CustomerMapView';

export function LeadDetailsMap({
   map,
   lead,
   route,
   routePoints = [],
   geoPoints = [],
   geoCurrentPoint = null,
   isRouteLoading = false,
}) {
   const hasRoutePoints = routePoints.length >= 2;
   const hasGeoPoints = geoPoints.length > 0;

   const geoRoutePoints = geoPoints.map((point) => [
      point.latitude,
      point.longitude,
   ]);

   const routeMarkers = hasRoutePoints
      ? [
           {
              id: 'route-start',
              position: routePoints[0],
              title: 'Откуда',
              description: lead.from_location || 'Не указано',
           },
           {
              id: 'route-end',
              position: routePoints[routePoints.length - 1],
              title: 'Куда',
              description: lead.to_location || 'Не указано',
           },
        ]
      : [];

   const geoMarkers = geoCurrentPoint
      ? [
           {
              id: 'geo-current-point',
              position: [geoCurrentPoint.latitude, geoCurrentPoint.longitude],
              title: 'Текущая позиция водителя',
              description: geoCurrentPoint.recordedAt
                 ? `Последнее обновление: ${geoCurrentPoint.recordedAt}`
                 : 'Координаты получены через WebSocket',
           },
        ]
      : [];

   const markers = [...routeMarkers, ...geoMarkers];

   const mapCenter = hasRoutePoints
      ? routePoints[0]
      : hasGeoPoints
        ? geoRoutePoints[geoRoutePoints.length - 1]
        : map.center;

   return (
      <Box
         sx={{
            position: 'relative',
            height: {
               xs: 220,
               sm: 280,
            },
            minHeight: 220,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            overflow: 'hidden',
            mb: 3,
            mt: 1,
         }}
      >
         {isRouteLoading && (
            <Box
               sx={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.55)',
               }}
            >
               <CircularProgress size={28} />
            </Box>
         )}

         <CustomerMapView
            center={mapCenter}
            zoom={hasRoutePoints ? 7 : hasGeoPoints ? 13 : map.zoom}
            markers={markers}
            route={route}
            routePoints={hasRoutePoints ? routePoints : []}
            geoRoutePoints={hasGeoPoints ? geoRoutePoints : []}
            handleMarkerClick={map.handleMarkerClick}
         />
      </Box>
   );
}

LeadDetailsMap.propTypes = {
   map: PropTypes.shape({
      center: PropTypes.array.isRequired,
      zoom: PropTypes.number.isRequired,
      markers: PropTypes.array.isRequired,
      routePoints: PropTypes.array,
      handleMarkerClick: PropTypes.func.isRequired,
   }).isRequired,
   lead: PropTypes.shape({
      from_location: PropTypes.string,
      to_location: PropTypes.string,
   }).isRequired,
   route: PropTypes.object,
   routePoints: PropTypes.array,
   geoPoints: PropTypes.arrayOf(
      PropTypes.shape({
         id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
         latitude: PropTypes.number.isRequired,
         longitude: PropTypes.number.isRequired,
         altitude: PropTypes.number,
         recordedAt: PropTypes.string,
      }),
   ),
   geoCurrentPoint: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      latitude: PropTypes.number.isRequired,
      longitude: PropTypes.number.isRequired,
      altitude: PropTypes.number,
      recordedAt: PropTypes.string,
   }),
   isRouteLoading: PropTypes.bool,
};

import PropTypes from 'prop-types';
import { Box, CircularProgress, Typography } from '@mui/material';

import { CustomerMapView } from '../../../customer-map/ui/CustomerMapView';
import {
   getLocationDescription,
   getLocationPosition,
} from '../../model/lead-details-map.helpers';
import { getWaypointTypeLabel } from '../../model/lead-route.helpers';

function getPassedStateLine(location) {
   return location?.is_passed ? '✓ Пройдена' : 'Не пройдена';
}

function withPassedState(description, location) {
   return `${description} · ${getPassedStateLine(location)}`;
}

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

   const waypoints = Array.isArray(lead.waypoints) ? lead.waypoints : [];

   const fromPosition = getLocationPosition(lead.from_location);
   const toPosition = getLocationPosition(lead.to_location);

   const waypointMarkers = waypoints
      .map((waypoint, index) => {
         const position = getLocationPosition(waypoint);

         if (!position) {
            return null;
         }

         const baseTitle = `Промежуточная точка ${index + 1}`;
         const typeLabel = getWaypointTypeLabel(waypoint.type);

         return {
            id: `route-waypoint-${index}`,
            position,
            title: typeLabel ? `${baseTitle} · ${typeLabel}` : baseTitle,
            description: withPassedState(
               getLocationDescription(waypoint, baseTitle),
               waypoint,
            ),
         };
      })
      .filter(Boolean);

   const routeMarkers =
      hasRoutePoints || fromPosition || toPosition || waypointMarkers.length
         ? [
              fromPosition
                 ? {
                      id: 'route-start',
                      position: fromPosition,
                      title: 'Откуда',
                      description: withPassedState(
                         getLocationDescription(
                            lead.from_location,
                            'Не указано',
                         ),
                         lead.from_location,
                      ),
                   }
                 : hasRoutePoints
                   ? {
                        id: 'route-start',
                        position: routePoints[0],
                        title: 'Откуда',
                        description: withPassedState(
                           getLocationDescription(
                              lead.from_location,
                              'Не указано',
                           ),
                           lead.from_location,
                        ),
                     }
                   : null,

              ...waypointMarkers,

              toPosition
                 ? {
                      id: 'route-end',
                      position: toPosition,
                      title: 'Куда',
                      description: withPassedState(
                         getLocationDescription(
                            lead.to_location,
                            'Не указано',
                         ),
                         lead.to_location,
                      ),
                   }
                 : hasRoutePoints
                   ? {
                        id: 'route-end',
                        position: routePoints[routePoints.length - 1],
                        title: 'Куда',
                        description: withPassedState(
                           getLocationDescription(
                              lead.to_location,
                              'Не указано',
                           ),
                           lead.to_location,
                        ),
                     }
                   : null,
           ].filter(Boolean)
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

   const mapCenter = fromPosition
      ? fromPosition
      : hasRoutePoints
        ? routePoints[0]
        : hasGeoPoints
          ? geoRoutePoints[geoRoutePoints.length - 1]
          : map.center;

   const routeBoundsKey = [
      lead?.id,
      routePoints.length,
      geoRoutePoints.length,
      markers.length,
      routePoints[0]?.join(','),
      routePoints[routePoints.length - 1]?.join(','),
      waypointMarkers.map((marker) => marker.position.join(',')).join('|'),
   ]
      .filter(Boolean)
      .join('|');

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
                  zIndex: 1000,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1.5,
                  backgroundColor: 'rgba(255, 255, 255, 0.72)',
                  backdropFilter: 'blur(1px)',
                  pointerEvents: 'auto',
               }}
            >
               <CircularProgress size={28} />

               <Typography
                  color="text.secondary"
                  sx={{
                     fontSize: 13,
                     fontWeight: 500,
                  }}
               >
                  Загружаем маршрут...
               </Typography>
            </Box>
         )}

         <CustomerMapView
            center={mapCenter}
            zoom={hasRoutePoints ? 7 : hasGeoPoints ? 13 : map.zoom}
            markers={markers}
            route={route}
            routePoints={hasRoutePoints ? routePoints : []}
            geoRoutePoints={hasGeoPoints ? geoRoutePoints : []}
            fitBoundsKey={routeBoundsKey}
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

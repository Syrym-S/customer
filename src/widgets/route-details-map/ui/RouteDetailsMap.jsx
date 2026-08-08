import { Box, CircularProgress, Typography } from '@mui/material';
import { MapView } from '../../../shared/ui/map/MapView';
import {
   DEFAULT_MAP_CENTER,
   DEFAULT_MAP_ZOOM,
} from '../../../shared/config/map.config';
import {
   getLocationDescription,
   getLocationPosition,
} from '../../../entities/lead/lib/lead-details-map.helpers';
import { driverMapIcon } from '../../../shared/ui/map/map-icons';

export function RouteDetailsMap({
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

         return {
            id: `route-waypoint-${index}`,
            position,
            title: `Промежуточная точка ${index + 1}`,
            description: getLocationDescription(
               waypoint,
               `Промежуточная точка ${index + 1}`,
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
                      description: getLocationDescription(
                         lead.from_location,
                         'Не указано',
                      ),
                   }
                 : hasRoutePoints
                   ? {
                        id: 'route-start',
                        position: routePoints[0],
                        title: 'Откуда',
                        description: getLocationDescription(
                           lead.from_location,
                           'Не указано',
                        ),
                     }
                   : null,

              ...waypointMarkers,

              toPosition
                 ? {
                      id: 'route-end',
                      position: toPosition,
                      title: 'Куда',
                      description: getLocationDescription(
                         lead.to_location,
                         'Не указано',
                      ),
                   }
                 : hasRoutePoints
                   ? {
                        id: 'route-end',
                        position: routePoints[routePoints.length - 1],
                        title: 'Куда',
                        description: getLocationDescription(
                           lead.to_location,
                           'Не указано',
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
              icon: driverMapIcon,
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
          : DEFAULT_MAP_CENTER;

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
                  color='text.secondary'
                  sx={{
                     fontSize: 13,
                     fontWeight: 500,
                  }}
               >
                  Загружаем маршрут...
               </Typography>
            </Box>
         )}

         <MapView
            center={mapCenter}
            zoom={hasRoutePoints ? 7 : hasGeoPoints ? 13 : DEFAULT_MAP_ZOOM}
            markers={markers}
            route={route}
            routePoints={hasRoutePoints ? routePoints : []}
            geoRoutePoints={hasGeoPoints ? geoRoutePoints : []}
            fitBoundsKey={routeBoundsKey}
         />
      </Box>
   );
}

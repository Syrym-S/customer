import { getLocationPoint } from '../../../shared/ui/map/map.helpers';
import { formatLocation } from '../../../shared/lib/location/location.helpers';

function getLeadWaypoints(lead) {
   const waypoints =
      lead?.waypoints ||
      lead?.raw?.route?.waypoints ||
      lead?.raw?.waypoints ||
      [];

   return Array.isArray(waypoints) ? waypoints : [];
}

export function buildLeadRouteMarkers(lead, routePoints = []) {
   const markers = [];
   const leadId = lead?.id || 'lead';

   const fromPoint = getLocationPoint(lead?.from_location);
   const toPoint = getLocationPoint(lead?.to_location);

   if (fromPoint) {
      markers.push({
         id: `${leadId}-route-start`,
         position: fromPoint,
         title: 'Точка А',
         description: formatLocation(
            lead.from_location,
            'Откуда не указано',
         ),
      });
   } else if (routePoints.length >= 2) {
      markers.push({
         id: `${leadId}-route-start`,
         position: routePoints[0],
         title: 'Точка А',
         description: formatLocation(
            lead?.from_location,
            'Откуда не указано',
         ),
      });
   }

   getLeadWaypoints(lead).forEach((waypoint, index) => {
      const point = getLocationPoint(waypoint);

      if (!point) {
         return;
      }

      markers.push({
         id: `${leadId}-route-waypoint-${index}`,
         position: point,
         title: `Промежуточная точка ${index + 1}`,
         description: formatLocation(
            waypoint,
            `Промежуточная точка ${index + 1}`,
         ),
      });
   });

   if (toPoint) {
      markers.push({
         id: `${leadId}-route-end`,
         position: toPoint,
         title: 'Точка Б',
         description: formatLocation(lead.to_location, 'Куда не указано'),
      });
   } else if (routePoints.length >= 2) {
      markers.push({
         id: `${leadId}-route-end`,
         position: routePoints[routePoints.length - 1],
         title: 'Точка Б',
         description: formatLocation(lead?.to_location, 'Куда не указано'),
      });
   }

   return markers;
}

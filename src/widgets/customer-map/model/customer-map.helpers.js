import { normalizeLocationValue } from '../../customer-leads/model/lead-edit-form.helpers';

export function hasCoordinate(value) {
   return value !== null && value !== undefined && value !== '';
}

export function getLocationPoint(location) {
   if (!location || typeof location !== 'object') {
      return null;
   }

   const lat = location.lat ?? location.latitude;
   const lon = location.lon ?? location.lng ?? location.longitude;

   if (!hasCoordinate(lat) || !hasCoordinate(lon)) {
      return null;
   }

   return [Number(lat), Number(lon)];
}

export function getLeadWaypoints(lead) {
   const waypoints =
      lead?.waypoints ||
      lead?.raw?.route?.waypoints ||
      lead?.raw?.waypoints ||
      [];

   return Array.isArray(waypoints) ? waypoints : [];
}

export function formatMapLocation(value, fallback) {
   return normalizeLocationValue(value) || fallback;
}

export function formatDriverName(driver) {
   return (
      driver?.fio ||
      driver?.name ||
      driver?.fullName ||
      driver?.full_name ||
      'Водитель не указан'
   );
}

export function formatDriverPhone(driver) {
   return driver?.phone || driver?.tel || driver?.telephone || '';
}

export function normalizePhoneHref(phone) {
   if (!phone) {
      return '';
   }

   const normalizedPhone = String(phone).replace(/[^\d+]/g, '');

   if (!normalizedPhone) {
      return '';
   }

   return normalizedPhone.startsWith('+')
      ? normalizedPhone
      : `+${normalizedPhone}`;
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
         description: formatMapLocation(
            lead.from_location,
            'Откуда не указано',
         ),
      });
   } else if (routePoints.length >= 2) {
      markers.push({
         id: `${leadId}-route-start`,
         position: routePoints[0],
         title: 'Точка А',
         description: formatMapLocation(
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
         description: formatMapLocation(
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
         description: formatMapLocation(lead.to_location, 'Куда не указано'),
      });
   } else if (routePoints.length >= 2) {
      markers.push({
         id: `${leadId}-route-end`,
         position: routePoints[routePoints.length - 1],
         title: 'Точка Б',
         description: formatMapLocation(lead?.to_location, 'Куда не указано'),
      });
   }

   return markers;
}

export function isValidMapPoint(point) {
   if (!Array.isArray(point) || point.length < 2) {
      return false;
   }

   const lat = Number(point[0]);
   const lng = Number(point[1]);

   return Number.isFinite(lat) && Number.isFinite(lng);
}

export function normalizeMapPoint(point) {
   return [Number(point[0]), Number(point[1])];
}

export function buildFitBoundsPoints({
   fitBoundsPoints = [],
   routes = [],
   geoRoutes = [],
   routePoints = [],
   geoRoutePoints = [],
   markers = [],
}) {
   if (fitBoundsPoints.length) {
      return fitBoundsPoints.filter(isValidMapPoint).map(normalizeMapPoint);
   }

   const routesPoints = routes.flatMap((route) => route.points || []);
   const geoRoutesPoints = geoRoutes.flatMap((route) => route.points || []);
   const markerPoints = markers
      .map((marker) => marker.position)
      .filter(Boolean);

   return [
      ...routesPoints,
      ...geoRoutesPoints,
      ...routePoints,
      ...geoRoutePoints,
      ...markerPoints,
   ]
      .filter(isValidMapPoint)
      .map(normalizeMapPoint);
}

export function buildFitBoundsKey(points = []) {
   return points.map((point) => point.join(',')).join('|');
}

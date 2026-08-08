export function hasCoordinate(value) {
   return value !== null && value !== undefined && value !== '';
}

export function getLocationPoint(location) {
   if (!location || typeof location !== 'object') {
      return null;
   }

   const lat = location.lat ?? location.latitude;
   const lng = location.lng ?? location.lon ?? location.longitude;

   if (!hasCoordinate(lat) || !hasCoordinate(lng)) {
      return null;
   }

   const normalizedLat = Number(lat);
   const normalizedLng = Number(lng);

   if (!Number.isFinite(normalizedLat) || !Number.isFinite(normalizedLng)) {
      return null;
   }

   return [normalizedLat, normalizedLng];
}

export function isValidMapPoint(point) {
   if (!Array.isArray(point) || point.length < 2) {
      return false;
   }

   return (
      Number.isFinite(Number(point[0])) && Number.isFinite(Number(point[1]))
   );
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

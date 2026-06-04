import polyline from '@mapbox/polyline';

export function decodeRoutePolyline(encodedPolyline) {
   if (!encodedPolyline) {
      return [];
   }

   try {
      return polyline.decode(encodedPolyline).map(([lat, lng]) => [lat, lng]);
   } catch (error) {
      console.error('Ошибка декодирования polyline:', error);

      return [];
   }
}

export function getEncodedPolylineFromRoute(route) {
   return (
      route?.polyline?.encodedPolyline ||
      route?.encodedPolyline ||
      route?.polyline ||
      ''
   );
}

function hasCoordinate(value) {
   return value !== null && value !== undefined;
}

export function buildLeadRoutePayload(lead) {
   const from = lead?.raw?.route?.from;
   const to = lead?.raw?.route?.to;

   if (
      !hasCoordinate(from?.lat) ||
      !hasCoordinate(from?.lng) ||
      !hasCoordinate(to?.lat) ||
      !hasCoordinate(to?.lng)
   ) {
      console.warn('Не хватает координат для генерации маршрута:', {
         from,
         to,
      });

      return null;
   }

   return {
      from_lat: from.lat,
      from_lon: from.lng,
      to_lat: to.lat,
      to_lon: to.lng,
   };
}

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

export function getRoutesFromGeneratedRoute(generatedRoute) {
   if (Array.isArray(generatedRoute?.routes)) {
      return generatedRoute.routes;
   }

   if (generatedRoute?.data && Array.isArray(generatedRoute.data.routes)) {
      return generatedRoute.data.routes;
   }

   if (generatedRoute?.polyline || generatedRoute?.encodedPolyline) {
      return [generatedRoute];
   }

   return [];
}

export function getEncodedPolylineFromRoute(route) {
   return (
      route?.polyline?.encodedPolyline ||
      route?.encodedPolyline ||
      route?.polyline ||
      ''
   );
}

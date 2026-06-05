import polyline from '@mapbox/polyline';

function hasValue(value) {
   return value !== null && value !== undefined && value !== '';
}

function getMockPoint(payload, prefix) {
   const lat = payload?.[`${prefix}_lat`];
   const lon = payload?.[`${prefix}_lon`];

   if (hasValue(lat) && hasValue(lon)) {
      return [Number(lat), Number(lon)];
   }

   return null;
}

export async function generateRouteMock(payload) {
   const fromPoint = getMockPoint(payload, 'from') ?? [52.2873, 76.9674];
   const toPoint = getMockPoint(payload, 'to') ?? [51.1694, 71.4491];

   const middlePoint = [
      (fromPoint[0] + toPoint[0]) / 2,
      (fromPoint[1] + toPoint[1]) / 2,
   ];

   const points = [fromPoint, middlePoint, toPoint];

   const encodedPolyline = polyline.encode(points);

   return {
      description: 'Тестовый маршрут',
      distanceMeters: 450000,
      duration: 21600,
      polyline: {
         encodedPolyline,
      },
   };
}

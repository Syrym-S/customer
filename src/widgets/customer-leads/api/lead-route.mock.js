import polyline from '@mapbox/polyline';

function getMockPoint(payload, prefix) {
   const lat = payload?.[`${prefix}_lat`];
   const lon = payload?.[`${prefix}_lon`];

   if (lat !== null && lat !== undefined && lon !== null && lon !== undefined) {
      return [lat, lon];
   }

   return null;
}

export async function generateRouteMock(payload) {
   const fromPoint = getMockPoint(payload, 'from');
   const toPoint = getMockPoint(payload, 'to');

   if (!fromPoint || !toPoint) {
      console.warn('Не хватает координат для mock route:', payload);

      return null;
   }

   const points = [fromPoint, [51.9, 74.8], toPoint];

   const encodedPolyline = polyline.encode(points);

   return {
      description: 'Павлодар → Астана',
      distanceMeters: 450000,
      duration: 21600,
      polyline: {
         encodedPolyline,
      },
   };
}

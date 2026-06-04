import polyline from '@mapbox/polyline';

export async function generateRouteMock(payload) {
   const points = [
      [payload.from.lat, payload.from.lng],
      [51.9, 74.8],
      [payload.to.lat, payload.to.lng],
   ];

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

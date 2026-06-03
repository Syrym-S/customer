export function hasPoint(lat, lng) {
   return (
      lat !== '' &&
      lat !== null &&
      lat !== undefined &&
      lng !== '' &&
      lng !== null &&
      lng !== undefined
   );
}

export function getRouteMarkers(form) {
   const markers = [];

   if (hasPoint(form.fromLat, form.fromLng)) {
      markers.push({
         id: 'from',
         position: [Number(form.fromLat), Number(form.fromLng)],
         title: 'Точка A',
         description: 'Откуда',
         draggable: true,
      });
   }

   if (hasPoint(form.toLat, form.toLng)) {
      markers.push({
         id: 'to',
         position: [Number(form.toLat), Number(form.toLng)],
         title: 'Точка B',
         description: 'Куда',
         draggable: true,
      });
   }

   return markers;
}

export function getRoutePoints(form) {
   const hasFromPoint = hasPoint(form.fromLat, form.fromLng);
   const hasToPoint = hasPoint(form.toLat, form.toLng);

   if (!hasFromPoint || !hasToPoint) {
      return [];
   }

   return [
      [Number(form.fromLat), Number(form.fromLng)],
      [Number(form.toLat), Number(form.toLng)],
   ];
}

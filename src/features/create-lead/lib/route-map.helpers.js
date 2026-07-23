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

function getWaypoints(form) {
   return Array.isArray(form.waypoints) ? form.waypoints : [];
}

export function buildRouteFitBoundsKey({ routePoints = [], markers = [] }) {
   return [
      routePoints.length,
      ...routePoints.map((point) => point.join(',')),
      ...markers.map((marker) => marker.position.join(',')),
   ]
      .filter(Boolean)
      .join('|');
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

   getWaypoints(form).forEach((waypoint, index) => {
      if (!hasPoint(waypoint.lat, waypoint.lng)) {
         return;
      }

      markers.push({
         id: `waypoint-${index}`,
         position: [Number(waypoint.lat), Number(waypoint.lng)],
         title: `Промежуточная точка ${index + 1}`,
         description: waypoint.location || `Точка ${index + 1}`,
         draggable: true,
      });
   });

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
   const points = [];

   if (hasPoint(form.fromLat, form.fromLng)) {
      points.push([Number(form.fromLat), Number(form.fromLng)]);
   }

   getWaypoints(form).forEach((waypoint) => {
      if (hasPoint(waypoint.lat, waypoint.lng)) {
         points.push([Number(waypoint.lat), Number(waypoint.lng)]);
      }
   });

   if (hasPoint(form.toLat, form.toLng)) {
      points.push([Number(form.toLat), Number(form.toLng)]);
   }

   return points.length >= 2 ? points : [];
}

import i18n from '../../../shared/i18n';

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
         title: i18n.t("route.pointA"),
         description: i18n.t("common.fields.origin"),
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
         title: i18n.t("route.waypoint", { index: index + 1 }),
         description: waypoint.location || i18n.t("route.point", { index: index + 1 }),
         draggable: true,
      });
   });

   if (hasPoint(form.toLat, form.toLng)) {
      markers.push({
         id: 'to',
         position: [Number(form.toLat), Number(form.toLng)],
         title: i18n.t("route.pointB"),
         description: i18n.t("common.fields.destination"),
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

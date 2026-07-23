export const setValueOptions = {
   shouldDirty: true,
   shouldTouch: true,
   shouldValidate: true,
};

export function getWaypointPointKey(index) {
   return `waypoint-${index}`;
}

export function buildFitBoundsPointsFromMarkers(markers = []) {
   return markers.map((marker) => marker.position).filter(Boolean);
}

export function buildFitBoundsKey(points = []) {
   return points.map((point) => point.join(',')).join('|');
}

export function buildRouteEditorMapState({ routeMarkers = [], map }) {
   const fitBoundsPoints = buildFitBoundsPointsFromMarkers(routeMarkers);

   return {
      fitBoundsPoints,
      fitBoundsKey: buildFitBoundsKey(fitBoundsPoints),
      center: fitBoundsPoints[0] || map.center,
      zoom: fitBoundsPoints.length >= 2 ? 7 : map.zoom,
   };
}

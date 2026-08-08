import {
   DEFAULT_MAP_CENTER,
   DEFAULT_MAP_ZOOM,
} from '../../../shared/config/map.config';
import { buildFitBoundsKey } from '../../../shared/ui/map/map.helpers';

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

export function buildRouteEditorMapState({ routeMarkers = [] }) {
   const fitBoundsPoints = buildFitBoundsPointsFromMarkers(routeMarkers);

   return {
      fitBoundsPoints,
      fitBoundsKey: buildFitBoundsKey(fitBoundsPoints),
      center: fitBoundsPoints[0] || DEFAULT_MAP_CENTER,
      zoom: fitBoundsPoints.length >= 2 ? 7 : DEFAULT_MAP_ZOOM,
   };
}

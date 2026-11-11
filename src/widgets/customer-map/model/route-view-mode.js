export const ROUTE_VIEW_MODE_ALL = 'all';
export const ROUTE_VIEW_MODE_PASSED = 'passed';
export const ROUTE_VIEW_MODE_PLANNED = 'planned';

export const ROUTE_VIEW_MODES = [
   ROUTE_VIEW_MODE_ALL,
   ROUTE_VIEW_MODE_PASSED,
   ROUTE_VIEW_MODE_PLANNED,
];

export const DEFAULT_ROUTE_VIEW_MODE = ROUTE_VIEW_MODE_ALL;

export function isPlannedRouteVisible(mode) {
   return mode !== ROUTE_VIEW_MODE_PASSED;
}

export function isPassedRouteVisible(mode) {
   return mode !== ROUTE_VIEW_MODE_PLANNED;
}

export function hasPlannedRoutePath({ routes = [], routePoints = [] }) {
   if (routePoints.length >= 2) {
      return true;
   }

   return routes.some((route) => (route.points?.length || 0) >= 2);
}

export function hasPassedRoutePath({ geoRoutes = [], geoRoutePoints = [] }) {
   if (geoRoutePoints.length >= 2) {
      return true;
   }

   return geoRoutes.some((route) => (route.points?.length || 0) >= 2);
}

export function resolveRouteViewFitBoundsPoints({
   fitBoundsPoints = [],
   selectedLeadId,
   visibleRoutes = [],
   visibleGeoRoutes = [],
   isFiltered = false,
}) {
   if (!fitBoundsPoints.length || !isFiltered || !selectedLeadId) {
      return fitBoundsPoints;
   }

   const visibleRoute = [...visibleRoutes, ...visibleGeoRoutes].find(
      (route) => String(route.id) === String(selectedLeadId),
   );

   return visibleRoute?.points?.length ? visibleRoute.points : [];
}

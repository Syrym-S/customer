const DEFAULT_CENTER = [43.241141, 76.871399];
const DEFAULT_ZOOM = 12;
const NO_MARKERS = [];
const NO_ROUTE_POINTS = [];

export function useCustomerMap() {
   function handleMarkerClick(marker) {
      console.log('marker click:', marker);
   }

   return {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      markers: NO_MARKERS,
      routePoints: NO_ROUTE_POINTS,
      handleMarkerClick,
   };
}

import L from 'leaflet';

export const driverIcon = L.divIcon({
   className: 'driver-marker',
   html: '<div class="driver-marker__icon">🚚</div>',
   iconSize: [38, 38],
   iconAnchor: [19, 19],
   popupAnchor: [0, -18],
});

export const ROUTE_TOOLTIP_PANE_NAME = 'routeTooltipPane';

export const CUSTOMER_MAP_TILE_LAYER = {
   attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
   url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=cb1_33bl_1_e67a46f1e67e6cbad8143c4e',
   
};

import L from 'leaflet';

export const driverMapIcon = L.divIcon({
   className: 'driver-marker',
   html: '<div class="driver-marker__icon">🚚</div>',
   iconSize: [38, 38],
   iconAnchor: [19, 19],
   popupAnchor: [0, -18],
});

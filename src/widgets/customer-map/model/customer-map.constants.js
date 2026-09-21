import L from 'leaflet';
import { getMarkerVisual } from './customer-map.helpers';

const MARKER_FONT_FAMILY = 'Roboto,Arial,sans-serif';

const driverTruckSvg =
   '<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M1 5h14v11H1z"/><path d="M15 9h4.2L23 13v3h-8z"/><circle cx="6" cy="18" r="2.3" stroke="#16243E" stroke-width="1.6"/><circle cx="18" cy="18" r="2.3" stroke="#16243E" stroke-width="1.6"/></svg>';

export const driverIcon = L.divIcon({
   className: 'driver-marker',
   html: `<span class="driver-marker__pulse"></span><span class="driver-marker__icon">${driverTruckSvg}</span>`,
   iconSize: [38, 38],
   iconAnchor: [19, 19],
   popupAnchor: [0, -20],
});

const pinIconCache = new Map();
const transitIconCache = new Map();
const arrowIconCache = new Map();

export function getPinIcon(color, label = '') {
   const key = `${color}|${label}`;

   if (!pinIconCache.has(key)) {
      const glyph = label
         ? `<circle cx="12.5" cy="12.5" r="8.5" fill="#fff"/><text x="12.5" y="12.5" dy=".35em" text-anchor="middle" font-family="${MARKER_FONT_FAMILY}" font-size="12" font-weight="700" fill="${color}">${label}</text>`
         : '<circle cx="12.5" cy="12.5" r="4.5" fill="#fff"/>';

      pinIconCache.set(
         key,
         L.divIcon({
            className: 'status-marker',
            html: `<svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 0C5.6 0 0 5.6 0 12.5 0 21.9 12.5 41 12.5 41S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z" fill="${color}" stroke="#fff" stroke-width="1.5"/>${glyph}</svg>`,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
         }),
      );
   }

   return pinIconCache.get(key);
}

export function getTransitIcon(color, label) {
   const key = `${color}|${label}`;

   if (!transitIconCache.has(key)) {
      const fontSize = String(label).length > 1 ? 10 : 12;

      transitIconCache.set(
         key,
         L.divIcon({
            className: 'status-marker',
            html: `<svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="9.5" fill="${color}" stroke="#fff" stroke-width="2"/><text x="11" y="11" dy=".35em" text-anchor="middle" font-family="${MARKER_FONT_FAMILY}" font-size="${fontSize}" font-weight="700" fill="#fff">${label}</text></svg>`,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
            popupAnchor: [0, -11],
         }),
      );
   }

   return transitIconCache.get(key);
}

export function getMarkerIcon(marker, color) {
   const { kind, label } = getMarkerVisual(marker);

   if (kind === 'driver') {
      return driverIcon;
   }

   if (kind === 'transit') {
      return getTransitIcon(color, label);
   }

   return getPinIcon(color, label);
}

const ARROW_ANGLE_STEP = 5;

export function getArrowIcon(color, angle) {
   const snappedAngle =
      (Math.round(angle / ARROW_ANGLE_STEP) * ARROW_ANGLE_STEP + 360) % 360;
   const key = `${color}|${snappedAngle}`;

   if (!arrowIconCache.has(key)) {
      arrowIconCache.set(
         key,
         L.divIcon({
            className: 'route-arrow',
            html: `<div class="route-arrow__glyph" style="transform:rotate(${snappedAngle}deg)"><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M3 2.5L13.5 8 3 13.5l2.6-5.5z" fill="${color}" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/></svg></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
         }),
      );
   }

   return arrowIconCache.get(key);
}

export const ROUTE_TOOLTIP_PANE_NAME = 'routeTooltipPane';
export const ROUTE_CASING_PANE_NAME = 'routeCasingPane';

export const CUSTOMER_MAP_TILE_LAYER = {
   attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
   url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=cb1_33bl_1_e67a46f1e67e6cbad8143c4e',

};

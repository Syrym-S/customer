import { ROUTE_CASING_PANE_NAME } from './customer-map.constants';

export const ROUTE_CASING_COLOR = '#ffffff';

const DIMMED_OPACITY = 0.18;
const HIGHLIGHT_OPACITY = 0.95;
const GEO_DASH_ARRAY = '8 8';
const GEO_WEIGHT = 4;
const CASING_EXTRA_WEIGHT = 3;
const CASING_OPACITY = 0.85;
const SELECTED_WEIGHT_BONUS = 2;
const HIGHLIGHTED_WEIGHT_BONUS = 1;

function fixed(hex) {
   return () => hex;
}

const routeStatusStyles = {
   new: {
      color: ({ primary }) => primary.main,
      weight: 5,
      opacity: 0.9,
   },
   add_driver: {
      color: ({ info }) => info.main,
      weight: 5,
      opacity: 0.9,
   },
   start_driver: {
      color: fixed('#5B3FD6'),
      weight: 5,
      opacity: 0.9,
   },
   start_loading: {
      color: fixed('#D97706'),
      weight: 5,
      opacity: 0.9,
   },
   verification_loading: {
      color: ({ success }) => success.main,
      weight: 5,
      opacity: 0.9,
   },
   start_unloading: {
      color: ({ secondary }) => secondary.main,
      weight: 5,
      opacity: 0.9,
   },
   verification_unloading: {
      color: fixed('#00897B'),
      weight: 5,
      opacity: 0.9,
   },
   finished: {
      color: ({ grey }) => grey[500],
      weight: 4,
      opacity: 0.55,
   },
   cancelled: {
      color: ({ grey }) => grey[600],
      weight: 4,
      opacity: 0.7,
      dashArray: '2 8',
   },
   emergency_situation: {
      color: fixed('#D0103A'),
      weight: 7,
      opacity: 0.95,
   },
   finished_emergency_situation: {
      color: fixed('#B0567F'),
      weight: 5,
      opacity: 0.6,
   },
};

export function getRouteStatusStyle(status, theme) {
   const entry = routeStatusStyles[status] || routeStatusStyles.new;

   return {
      color: entry.color(theme.palette),
      weight: entry.weight,
      opacity: entry.opacity,
      dashArray: entry.dashArray,
   };
}

export function getRoutePathStyle({
   status,
   theme,
   isSelected = false,
   isHighlighted = false,
   isDimmed = false,
   isGeo = false,
}) {
   const base = getRouteStatusStyle(status, theme);

   const weightBonus = isSelected
      ? SELECTED_WEIGHT_BONUS
      : isHighlighted
        ? HIGHLIGHTED_WEIGHT_BONUS
        : 0;

   const weight = (isGeo ? GEO_WEIGHT : base.weight) + weightBonus;

   const opacity = isDimmed
      ? DIMMED_OPACITY
      : isHighlighted
        ? HIGHLIGHT_OPACITY
        : base.opacity;

   const dashArray = isGeo ? GEO_DASH_ARRAY : base.dashArray;

   const path = { color: base.color, weight, opacity };

   if (dashArray) {
      path.dashArray = dashArray;
   }

   return {
      path,
      casing: {
         color: ROUTE_CASING_COLOR,
         weight: weight + CASING_EXTRA_WEIGHT,
         opacity: isDimmed ? DIMMED_OPACITY : CASING_OPACITY,
         interactive: false,
         pane: ROUTE_CASING_PANE_NAME,
      },
   };
}

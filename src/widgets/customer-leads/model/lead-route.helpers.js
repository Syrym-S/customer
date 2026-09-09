import { normalizeLocationValue } from './lead-edit-form.helpers';

export function getWaypointLabel(waypoint) {
   return (
      normalizeLocationValue(waypoint) ||
      waypoint?.address ||
      waypoint?.label ||
      'Не указано'
   );
}

export const waypointTypeLabels = {
   loading: 'Погрузка',
   unloading: 'Разгрузка',
   check_passes: 'Транзит',
};

export function getWaypointTypeLabel(type) {
   return waypointTypeLabels[type] || null;
}

// Reuses the same palette/rgba pairing as leadStatusStyles in lead.helpers.js
// (start_loading -> warning, start_unloading -> secondary) so waypoint type
// chips read consistently with the lead status chips elsewhere in the app.
export const waypointTypeChipColors = {
   loading: 'warning',
   unloading: 'secondary',
   check_passes: 'info',
};

export function getWaypointTypeChipColor(type) {
   return waypointTypeChipColors[type] || 'primary';
}

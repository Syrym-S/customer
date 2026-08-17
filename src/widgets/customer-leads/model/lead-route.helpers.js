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
};

export function getWaypointTypeLabel(type) {
   return waypointTypeLabels[type] || null;
}

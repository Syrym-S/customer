import { normalizeLocationValue } from './lead-edit-form.helpers';

export function getWaypointLabel(waypoint) {
   return (
      normalizeLocationValue(waypoint) ||
      waypoint?.address ||
      waypoint?.label ||
      'Не указано'
   );
}

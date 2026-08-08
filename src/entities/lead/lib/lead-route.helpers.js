import { normalizeLocationValue } from '../../../shared/lib/location/location.helpers';

export function getWaypointLabel(waypoint) {
   return (
      normalizeLocationValue(waypoint) ||
      waypoint?.address ||
      waypoint?.label ||
      'Не указано'
   );
}

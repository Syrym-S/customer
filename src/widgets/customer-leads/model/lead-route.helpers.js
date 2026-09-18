import { normalizeLocationValue } from './lead-edit-form.helpers';
import { getPointScheduleByIndex } from '../../../features/create-lead/lib/point-schedule.helpers';

export { getPointScheduleByIndex };

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

export function formatScheduleDatePart(value) {
   if (!value || typeof value !== 'string') {
      return '';
   }

   const [datePart] = value.split(' ');
   const [year, month, day] = datePart.split('-');

   if (!year || !month || !day) {
      return '';
   }

   return `${day}.${month}.${year}`;
}

export function getPointScheduleLabel(schedule) {
   if (!schedule) {
      return null;
   }

   const startLabel = formatScheduleDatePart(schedule.start_at);
   const endLabel = formatScheduleDatePart(schedule.end_at);

   if (startLabel && endLabel && startLabel !== endLabel) {
      return `${startLabel} – ${endLabel}`;
   }

   return startLabel || endLabel || null;
}

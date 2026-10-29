import { normalizeLocationValue } from './lead-edit-form.helpers';
import i18n from '../../../shared/i18n';
import { getPointScheduleByIndex } from '../../../features/create-lead/lib/point-schedule.helpers';

export { getPointScheduleByIndex };

export function getWaypointLabel(waypoint) {
   return (
      normalizeLocationValue(waypoint) ||
      waypoint?.address ||
      waypoint?.label ||
      i18n.t("common.empty.notSpecifiedN")
   );
}

const WAYPOINT_TYPE_LABEL_KEYS = {
   loading: 'enums.waypointType.loading',
   unloading: 'enums.waypointType.unloading',
   check_passes: 'enums.waypointType.check_passes',
};

export function getWaypointTypeLabel(type) {
   const key = WAYPOINT_TYPE_LABEL_KEYS[type];

   return key ? i18n.t(key) : null;
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

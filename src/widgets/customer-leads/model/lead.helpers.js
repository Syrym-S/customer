import i18n from '../../../shared/i18n';

export const LEAD_STATUS_LABEL_KEYS = {
   new: 'enums.leadStatus.new',
   add_driver: 'enums.leadStatus.add_driver',
   start_driver: 'enums.leadStatus.start_driver',
   start_loading: 'enums.leadStatus.start_loading',
   verification_loading: 'enums.leadStatus.verification_loading',
   start_unloading: 'enums.leadStatus.start_unloading',
   verification_unloading: 'enums.leadStatus.verification_unloading',
   sign_avr: 'enums.leadStatus.sign_avr',
   finished: 'enums.leadStatus.finished',
   cancelled: 'enums.leadStatus.cancelled',
   emergency_situation: 'enums.leadStatus.emergency_situation',
   finished_emergency_situation: 'enums.leadStatus.finished_emergency_situation',
};

const activeTrackingLeadStatuses = new Set([
   'start_driver',
   'start_loading',
   'verification_loading',
   'start_unloading',
   'verification_unloading',
   'sign_avr',
   'emergency_situation',
]);

export function isLeadTrackingActive(status) {
   return activeTrackingLeadStatuses.has(status);
}

export const leadStatusStyles = {
   new: {
      borderColor: 'primary.main',
      color: 'primary.main',
      backgroundColor: 'rgba(33, 150, 243, 0.04)',
   },

   add_driver: {
      borderColor: 'info.main',
      color: 'info.main',
      backgroundColor: 'rgba(2, 136, 209, 0.06)',
   },

   start_driver: {
      borderColor: 'info.main',
      color: 'info.main',
      backgroundColor: 'rgba(2, 136, 209, 0.06)',
   },

   start_loading: {
      borderColor: 'warning.main',
      color: 'warning.main',
      backgroundColor: 'rgba(237, 108, 2, 0.06)',
   },

   verification_loading: {
      borderColor: 'success.main',
      color: 'success.main',
      backgroundColor: 'rgba(46, 125, 50, 0.06)',
   },

   start_unloading: {
      borderColor: 'secondary.main',
      color: 'secondary.main',
      backgroundColor: 'rgba(156, 39, 176, 0.06)',
   },

   verification_unloading: {
      borderColor: 'success.dark',
      color: 'success.dark',
      backgroundColor: 'rgba(27, 94, 32, 0.06)',
   },

   sign_avr: {
      borderColor: 'primary.main',
      color: 'primary.main',
      backgroundColor: 'rgba(33, 150, 243, 0.04)',
   },

   finished: {
      borderColor: 'grey.400',
      color: 'text.secondary',
      backgroundColor: 'grey.100',
   },

   cancelled: {
      borderColor: 'error.main',
      color: 'error.main',
      backgroundColor: 'rgba(211, 47, 47, 0.06)',
   },

   emergency_situation: {
      borderColor: 'error.main',
      color: 'error.main',
      backgroundColor: 'rgba(211, 47, 47, 0.06)',
   },

   finished_emergency_situation: {
      borderColor: 'warning.main',
      color: 'warning.main',
      backgroundColor: 'rgba(237, 108, 2, 0.06)',
   },
};

export function getLeadStatusLabel(status) {
   const key = LEAD_STATUS_LABEL_KEYS[status];

   return (key && i18n.t(key)) || status || i18n.t("common.empty.notSpecifiedM");
}

export function getLeadStatusFilterOptions() {
   return Object.entries(LEAD_STATUS_LABEL_KEYS).map(([value, key]) => ({
      label: i18n.t(key),
      value,
   }));
}

// Terminal statuses: an order in one of these is no longer in progress and is
// absent from the active list that `/customer/v1/leads` serves.
export const archivedLeadStatuses = [
   'finished',
   'cancelled',
   'finished_emergency_situation',
];

export function isArchivedLeadStatus(status) {
   return archivedLeadStatuses.includes(String(status || '').toLowerCase());
}

export function isActiveLeadStatus(status) {
   return !isArchivedLeadStatus(status);
}

// The status dropdown must not offer a status the current list can never
// contain: picking "finished" while the active list is shown yields nothing.
export function getActiveLeadStatusFilterOptions() {
   return getLeadStatusFilterOptions().filter((option) =>
      isActiveLeadStatus(option.value),
   );
}

export function getLeadStatusStyles(status) {
   return leadStatusStyles[status] || leadStatusStyles.new;
}

export const DRAFT_STATUS_LABEL_KEY = 'enums.leadStatus.draft';

const draftStatusStyle = {
   borderColor: 'grey.500',
   color: 'text.secondary',
   backgroundColor: 'grey.200',
};

export function getDisplayLeadStatusLabel(lead) {
   return isDraftLead(lead)
      ? i18n.t(DRAFT_STATUS_LABEL_KEY)
      : getLeadStatusLabel(lead?.status);
}

export function getDisplayLeadStatusStyles(lead) {
   return isDraftLead(lead) ? draftStatusStyle : getLeadStatusStyles(lead?.status);
}

// Resolves the theme-path `color` of a status (e.g. 'success.dark') to a
// literal color string, for consumers that can't take theme paths (Leaflet).
export function getLeadStatusColorValue(status, theme) {
   const path = getLeadStatusStyles(status).color;

   const value = path
      .split('.')
      .reduce((node, key) => node?.[key], theme.palette);

   return typeof value === 'string' ? value : theme.palette.primary.main;
}

// Moved here from factorings.helpers.js — this is a lead-status helper, not
// a factoring one; it lived there unused until the AVR flow needed it.
export function isFinishedLead(lead) {
   return String(lead?.status || '').toLowerCase() === 'finished';
}

export function isSignAvrLead(lead) {
   return String(lead?.status || '').toLowerCase() === 'sign_avr';
}

export function isCancelledLead(lead) {
   return String(lead?.status || '').toLowerCase() === 'cancelled';
}

export function isEmergencyLead(lead) {
   return String(lead?.status || '').toLowerCase() === 'emergency_situation';
}

export function isFinishedEmergencyLead(lead) {
   return (
      String(lead?.status || '').toLowerCase() ===
      'finished_emergency_situation'
   );
}

export function isDraftLead(lead) {
   return lead?.is_draft === true;
}

export function canEditGracePeriod(lead) {
   return (
      !isCancelledLead(lead) &&
      !isFinishedLead(lead) &&
      !isEmergencyLead(lead) &&
      !isFinishedEmergencyLead(lead)
   );
}

const EMPTY_LOCATION_PLACEHOLDER_KEY = 'common.empty.notSpecifiedN';

function hasLocationValue(location) {
   if (!location) {
      return false;
   }

   if (typeof location === 'string') {
      const trimmed = location.trim();

      return trimmed !== '' && trimmed !== i18n.t(EMPTY_LOCATION_PLACEHOLDER_KEY);
   }

   if (typeof location === 'object') {
      return Boolean(
         location.address || location.city || location.region || location.country,
      );
   }

   return false;
}

export function isDraftPublishable(lead) {
   const hasFromLocation = hasLocationValue(lead?.from_location);
   const hasToLocation = hasLocationValue(lead?.to_location);
   const hasCargo = Array.isArray(lead?.cargos) && lead.cargos.length > 0;

   return hasFromLocation && hasToLocation && hasCargo;
}

export function formatLeadDate(value) {
   if (!value) {
      return i18n.t("common.empty.notSpecifiedN");
   }

   let dateValue = value;

   if (typeof value === 'object') {
      dateValue = value.date || value.datetime || value.value || '';

      if (!dateValue) {
         return i18n.t("common.empty.notSpecifiedN");
      }
   }

   const normalizedDateValue =
      typeof dateValue === 'string' ? dateValue.replace(' ', 'T') : dateValue;

   const date = new Date(normalizedDateValue);

   if (Number.isNaN(date.getTime())) {
      return String(dateValue || i18n.t("common.empty.notSpecifiedN"));
   }

   return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
   });
}

export const leadStatusLabels = {
   new: 'Новый',
   add_driver: 'Водитель добавлен',
   start_driver: 'Поездка начата',
   start_loading: 'Погрузка',
   verification_loading: 'Погрузка подтверждена',
   start_unloading: 'Разгрузка',
   verification_unloading: 'Разгрузка подтверждена',
   sign_avr: 'Подписание АВР',
   finished: 'Завершен',
   cancelled: 'Отменен',
   emergency_situation: 'Аварийная ситуация',
   finished_emergency_situation: 'Завершен (аварийная ситуация)',
};

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
   return leadStatusLabels[status] || status || 'Не указан';
}

export function getLeadStatusFilterOptions() {
   return Object.entries(leadStatusLabels).map(([value, label]) => ({
      label,
      value,
   }));
}

export function getLeadStatusStyles(status) {
   return leadStatusStyles[status] || leadStatusStyles.new;
}

export const DRAFT_STATUS_LABEL = 'Черновик';

const draftStatusStyle = {
   borderColor: 'grey.500',
   color: 'text.secondary',
   backgroundColor: 'grey.200',
};

export function getDisplayLeadStatusLabel(lead) {
   return isDraftLead(lead) ? DRAFT_STATUS_LABEL : getLeadStatusLabel(lead?.status);
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

const EMPTY_LOCATION_PLACEHOLDER = 'Не указано';

function hasLocationValue(location) {
   if (!location) {
      return false;
   }

   if (typeof location === 'string') {
      const trimmed = location.trim();

      return trimmed !== '' && trimmed !== EMPTY_LOCATION_PLACEHOLDER;
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
      return 'Не указано';
   }

   let dateValue = value;

   if (typeof value === 'object') {
      dateValue = value.date || value.datetime || value.value || '';

      if (!dateValue) {
         return 'Не указано';
      }
   }

   const normalizedDateValue =
      typeof dateValue === 'string' ? dateValue.replace(' ', 'T') : dateValue;

   const date = new Date(normalizedDateValue);

   if (Number.isNaN(date.getTime())) {
      return String(dateValue || 'Не указано');
   }

   return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
   });
}

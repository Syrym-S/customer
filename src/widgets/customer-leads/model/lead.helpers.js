export const leadStatusLabels = {
   new: 'Новый',
   add_driver: 'Водитель добавлен',
   start_driver: 'Поездка начата',
   start_loading: 'Погрузка',
   verification_loading: 'Погрузка подтверждена',
   start_unloading: 'Разгрузка',
   verification_unloading: 'Разгрузка подтверждена',
   finished: 'Завершён',
   cancelled: 'Отменён',
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

// Moved here from factorings.helpers.js — this is a lead-status helper, not
// a factoring one; it lived there unused until the AVR flow needed it.
export function isFinishedLead(lead) {
   return String(lead?.status || '').toLowerCase() === 'finished';
}
export const leadStatusLabels = {
   new: 'Новый',

   add_driver: 'Водитель добавлен',
   driver_added: 'Водитель добавлен',

   start_driver: 'Погрузка',
   loading: 'Погрузка',
   start_loading: 'Погрузка',

   loading_confirmed: 'Погрузка подтверждена',
   confirm_loading: 'Погрузка подтверждена',

   unloading: 'Разгрузка',
   start_unloading: 'Разгрузка',

   unloading_confirmed: 'Разгрузка подтверждена',
   confirm_unloading: 'Разгрузка подтверждена',

   completed: 'Завершён',
   done: 'Завершён',
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
   driver_added: {
      borderColor: 'info.main',
      color: 'info.main',
      backgroundColor: 'rgba(2, 136, 209, 0.06)',
   },

   start_driver: {
      borderColor: 'warning.main',
      color: 'warning.main',
      backgroundColor: 'rgba(237, 108, 2, 0.06)',
   },
   loading: {
      borderColor: 'warning.main',
      color: 'warning.main',
      backgroundColor: 'rgba(237, 108, 2, 0.06)',
   },
   start_loading: {
      borderColor: 'warning.main',
      color: 'warning.main',
      backgroundColor: 'rgba(237, 108, 2, 0.06)',
   },

   loading_confirmed: {
      borderColor: 'success.main',
      color: 'success.main',
      backgroundColor: 'rgba(46, 125, 50, 0.06)',
   },
   confirm_loading: {
      borderColor: 'success.main',
      color: 'success.main',
      backgroundColor: 'rgba(46, 125, 50, 0.06)',
   },

   unloading: {
      borderColor: 'secondary.main',
      color: 'secondary.main',
      backgroundColor: 'rgba(156, 39, 176, 0.06)',
   },
   start_unloading: {
      borderColor: 'secondary.main',
      color: 'secondary.main',
      backgroundColor: 'rgba(156, 39, 176, 0.06)',
   },

   unloading_confirmed: {
      borderColor: 'success.dark',
      color: 'success.dark',
      backgroundColor: 'rgba(27, 94, 32, 0.06)',
   },
   confirm_unloading: {
      borderColor: 'success.dark',
      color: 'success.dark',
      backgroundColor: 'rgba(27, 94, 32, 0.06)',
   },

   completed: {
      borderColor: 'grey.400',
      color: 'text.secondary',
      backgroundColor: 'grey.100',
   },
   done: {
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

export function getLeadStatusStyles(status) {
   return leadStatusStyles[status] || leadStatusStyles.new;
}
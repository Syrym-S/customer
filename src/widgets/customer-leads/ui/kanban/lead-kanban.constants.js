export const LEAD_KANBAN_COLUMNS = [
   {
      status: 'new',
      title: 'Новые',
      accentColor: 'success',
   },
   {
      status: 'add_driver',
      title: 'Водитель назначен',
      accentColor: 'info',
   },
   {
      status: 'start_driver',
      title: 'Водитель выехал',
      accentColor: 'primary',
   },
   {
      status: 'loading',
      title: 'Погрузка',
      accentColor: 'warning',
   },
   {
      status: 'in_progress',
      title: 'В пути',
      accentColor: 'secondary',
   },
   {
      status: 'unloading',
      title: 'Разгрузка',
      accentColor: 'info',
   },
   {
      status: 'finished',
      title: 'Завершены',
      accentColor: 'success',
   },
   {
      status: 'cancelled',
      title: 'Отменены',
      accentColor: 'error',
   },
];

export const UNKNOWN_LEAD_STATUS = 'unknown';

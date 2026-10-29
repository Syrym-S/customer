export const LEAD_KANBAN_COLUMNS = [
   {
      status: 'new',
      titleKey: 'enums.leadStatusFilter.new',
      accentColor: 'success',
   },
   {
      status: 'add_driver',
      titleKey: 'enums.leadStatusFilter.driverAssigned',
      accentColor: 'info',
   },
   {
      status: 'start_driver',
      titleKey: 'enums.leadStatusFilter.driverDeparted',
      accentColor: 'primary',
   },
   {
      status: 'loading',
      titleKey: 'enums.leadStatus.start_loading',
      accentColor: 'warning',
   },
   {
      status: 'in_progress',
      titleKey: 'enums.leadStatusFilter.inTransit',
      accentColor: 'secondary',
   },
   {
      status: 'unloading',
      titleKey: 'enums.leadStatus.start_unloading',
      accentColor: 'info',
   },
   {
      status: 'finished',
      titleKey: 'enums.leadStatusFilter.finished',
      accentColor: 'success',
   },
   {
      status: 'cancelled',
      titleKey: 'enums.leadStatusFilter.cancelled',
      accentColor: 'error',
   },
];

export const UNKNOWN_LEAD_STATUS = 'unknown';

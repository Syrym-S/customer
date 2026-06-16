export const tenderStatusLabels = {
   new: 'Новый',
   active: 'Активный',
   closed: 'Закрыт',
   cancelled: 'Отменён',
};

export const tenderStatusStyles = {
   new: {
      borderColor: 'primary.main',
      color: 'primary.main',
      backgroundColor: 'rgba(33, 150, 243, 0.04)',
   },
   active: {
      borderColor: 'success.main',
      color: 'success.main',
      backgroundColor: 'rgba(46, 125, 50, 0.06)',
   },
   closed: {
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

export function hasValue(value) {
   return value !== null && value !== undefined && value !== '';
}

export function getTimeLeft(endDateTime, status) {
   if (status === 'cancelled') return 'Отменён';
   if (status === 'closed') return 'Завершён';

   if (!endDateTime) return 'Не указано';

   const endDate = new Date(endDateTime);
   const endTime = endDate.getTime();

   if (Number.isNaN(endTime)) return 'Некорректная дата';

   const diffMs = endTime - Date.now();

   if (diffMs <= 0) return 'Завершён';

   const totalMinutes = Math.floor(diffMs / 1000 / 60);
   const days = Math.floor(totalMinutes / 60 / 24);
   const hours = Math.floor((totalMinutes - days * 24 * 60) / 60);
   const minutes = totalMinutes % 60;

   if (days > 0) {
      return `${days} д ${hours} ч`;
   }

   if (hours > 0) {
      return `${hours} ч ${minutes} мин`;
   }

   return `${minutes} мин`;
}

export function getCurrentDateTimeForTenderApi() {
   const date = new Date();

   const year = date.getFullYear();
   const month = String(date.getMonth() + 1).padStart(2, '0');
   const day = String(date.getDate()).padStart(2, '0');
   const hours = String(date.getHours()).padStart(2, '0');
   const minutes = String(date.getMinutes()).padStart(2, '0');
   const seconds = String(date.getSeconds()).padStart(2, '0');

   return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

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

export function getTenderCargos(tender) {
   if (Array.isArray(tender?.lead?.cargos)) {
      return tender.lead.cargos;
   }

   if (Array.isArray(tender?.cargos)) {
      return tender.cargos;
   }

   return [];
}

export function getTenderTotalCargoWeight(tender) {
   return getTenderCargos(tender).reduce((sum, cargo) => {
      const weight = Number(cargo.weight_kg);

      return Number.isNaN(weight) ? sum : sum + weight;
   }, 0);
}

export function getTenderCargoTypeLabel(tender) {
   const cargos = getTenderCargos(tender);

   if (!cargos.length) {
      return 'Не указан';
   }

   if (cargos.length === 1) {
      return cargos[0]?.type || 'Не указан';
   }

   return `${cargos[0]?.type || 'Не указан'} + ещё ${cargos.length - 1}`;
}

export function getTenderCargoPriceLabel(cargo, currency = 'KZT') {
   if (!hasValue(cargo?.cargo_price)) {
      return 'Не указано';
   }

   return `${Number(cargo.cargo_price).toLocaleString('ru-RU')} ${currency}`.trim();
}

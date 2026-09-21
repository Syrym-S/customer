import { formatAmount } from '../../../shared/helpers/currency-format.helpers';

export const tenderStatusLabels = {
   new: 'Новый',
   active: 'Активный',
   closed: 'Закрыт',
   cancelled: 'Отменен',
};

export const publicationTypeLabels = {
   public: 'Публичный',
   private: 'Приватный',
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

// closed/cancelled are the tender's two terminal statuses (analogous to
// leads' finished/cancelled — see isFinishedLead in lead.helpers.js).
export function isClosedTender(tender) {
   return String(tender?.status || '').toLowerCase() === 'closed';
}

export function isCancelledTender(tender) {
   return String(tender?.status || '').toLowerCase() === 'cancelled';
}

// The backend validates/stores public_date_time and end_date_time as
// Asia/Almaty wall-clock time (bare "YYYY-MM-DD HH:mm:ss", no offset) — NOT
// UTC and NOT the viewer's own timezone. Confirmed live: sending a true UTC
// instant produced a 422 "must be in the present or future", since the
// backend's own "now" (Almaty, UTC+5) was 5 hours ahead of what was sent.
// Do not "fix" this back to UTC — Kazakhstan runs this single zone with no
// DST (fixed UTC+5 since 2005), which is why a hardcoded "+05:00" offset
// below is exact, not an approximation.
export const TENDER_API_TIMEZONE = 'Asia/Almaty';

// Reads an absolute instant's calendar/clock fields as they'd read on a
// wall clock in Asia/Almaty, regardless of what timezone the browser itself
// is in — so this stays correct even for a user whose device isn't in
// Kazakhstan.
function getAlmatyDateTimeParts(date) {
   const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: TENDER_API_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
   });

   const partMap = {};

   for (const part of formatter.formatToParts(date)) {
      if (part.type !== 'literal') {
         partMap[part.type] = part.value;
      }
   }

   return partMap;
}

// Converts an absolute instant (any Date) into the "YYYY-MM-DD HH:mm:ss"
// string the tender API expects, expressed in Asia/Almaty wall-clock time.
export function formatDateToTenderApiDateTime(date) {
   if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      return '';
   }

   const { year, month, day, hour, minute, second } =
      getAlmatyDateTimeParts(date);

   return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

// Parses a "YYYY-MM-DD HH:mm:ss" string returned by the tender API (which is
// Asia/Almaty wall-clock time, per above) back into the correct absolute
// instant.
export function parseTenderApiDateTime(value) {
   if (!value || typeof value !== 'string') {
      return null;
   }

   const date = new Date(`${value.replace(' ', 'T')}+05:00`);

   return Number.isNaN(date.getTime()) ? null : date;
}

export function getTimeLeft(endDateTime, status) {
   if (status === 'cancelled') return 'Отменен';
   if (status === 'closed') return 'Завершен';

   if (!endDateTime) return 'Не указано';

   const endDate = parseTenderApiDateTime(endDateTime);

   if (!endDate) return 'Некорректная дата';

   const endTime = endDate.getTime();

   const diffMs = endTime - Date.now();

   if (diffMs <= 0) return 'Завершен';

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

   return `${cargos[0]?.type || 'Не указан'} + еще ${cargos.length - 1}`;
}

export function getTenderCargoPriceLabel(cargo, currency = 'KZT') {
   const formattedAmount = formatAmount(cargo?.cargo_price);

   if (!formattedAmount) {
      return 'Не указано';
   }

   return `${formattedAmount} ${currency}`.trim();
}

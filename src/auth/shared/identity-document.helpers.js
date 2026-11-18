// Sent to the backend exactly as written (same convention as driver-mobile).
export const DOCUMENT_ISSUED_BY_OPTIONS = ['МЮ РК', 'МВД РК'];

// "Today" as a YYYY-MM-DD date input value in Asia/Almaty wall-clock time,
// mirroring customer's getTodayDateInputValue (point-schedule.helpers.js).
export function getTodayDateInputValue() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Almaty',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const partMap = {};

  for (const part of formatter.formatToParts(new Date())) {
    if (part.type !== 'literal') {
      partMap[part.type] = part.value;
    }
  }

  return `${partMap.year}-${partMap.month}-${partMap.day}`;
}

export function validateNotAfterToday(value) {
  if (!value) {
    return true;
  }

  return (
    value <= getTodayDateInputValue() ||
    'Дата не может быть позже сегодняшнего дня'
  );
}

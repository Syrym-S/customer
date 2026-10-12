function toFiniteNumber(value) {
   const number = Number(value);

   return Number.isFinite(number) ? number : 0;
}

export function calcDeltaValue(current, previous) {
   const currentValue = toFiniteNumber(current);
   const previousValue = toFiniteNumber(previous);
   const absolute = currentValue - previousValue;

   let percent = null;

   if (previousValue !== 0) {
      percent = (absolute / Math.abs(previousValue)) * 100;
   }

   let direction = 'flat';

   if (absolute > 0) {
      direction = 'up';
   } else if (absolute < 0) {
      direction = 'down';
   }

   return { absolute, percent, direction };
}

export function isCustomAnalyticsPeriod(value) {
   return Boolean(value) && typeof value === 'object';
}

export function isSameAnalyticsPeriod(first, second) {
   if (isCustomAnalyticsPeriod(first) && isCustomAnalyticsPeriod(second)) {
      return first.from === second.from && first.to === second.to;
   }

   return first === second;
}

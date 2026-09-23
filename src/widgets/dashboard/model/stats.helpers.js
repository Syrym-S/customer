const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;

function formatIsoDate(value) {
   const match = ISO_DATE_PATTERN.exec(value ?? '');

   if (!match) {
      return '';
   }

   return `${match[3]}.${match[2]}.${match[1]}`;
}

export function formatStatsRange(from, to) {
   const formattedFrom = formatIsoDate(from);
   const formattedTo = formatIsoDate(to);

   if (!formattedFrom || !formattedTo) {
      return '';
   }

   if (formattedFrom === formattedTo) {
      return formattedFrom;
   }

   return `${formattedFrom} — ${formattedTo}`;
}

function formatShortIsoDate(value) {
   const match = ISO_DATE_PATTERN.exec(value ?? '');

   if (!match) {
      return '';
   }

   return `${match[3]}.${match[2]}.${match[1].slice(2)}`;
}

export function formatStatsRangeShort(from, to) {
   const formattedFrom = formatShortIsoDate(from);
   const formattedTo = formatShortIsoDate(to);

   if (!formattedFrom || !formattedTo) {
      return '';
   }

   if (formattedFrom === formattedTo) {
      return formattedFrom;
   }

   return `${formattedFrom} — ${formattedTo}`;
}

export function isCustomStatsPeriod(value) {
   return Boolean(value) && typeof value === 'object';
}

export function isSameStatsPeriod(first, second) {
   if (isCustomStatsPeriod(first) && isCustomStatsPeriod(second)) {
      return first.from === second.from && first.to === second.to;
   }

   return first === second;
}

export function toIsoDateOnly(value) {
   const match = ISO_DATE_PATTERN.exec(value ?? '');

   return match ? match[0] : '';
}

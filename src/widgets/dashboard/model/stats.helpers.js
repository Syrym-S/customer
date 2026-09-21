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

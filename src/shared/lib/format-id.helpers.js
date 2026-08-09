export function formatCompactId(id, { prefixLength = 4, suffixLength = 5, threshold = 12 } = {}) {
   if (!id) {
      return '—';
   }

   const value = String(id);

   if (value.length <= threshold) {
      return value;
   }

   return `${value.slice(0, prefixLength)}…${value.slice(-suffixLength)}`;
}

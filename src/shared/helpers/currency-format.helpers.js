// Groups a numeric amount with thousand separators per ru-RU convention
// (e.g. 5000000 -> "5 000 000"). Currency code/symbol is intentionally not
// part of this helper — callers already render it separately (e.g. "5 000
// USD") and should keep doing so.
export function formatAmount(value) {
   if (value === null || value === undefined || value === '') {
      return '';
   }

   const numericValue = Number(value);

   if (Number.isNaN(numericValue)) {
      return '';
   }

   return new Intl.NumberFormat('ru-RU').format(numericValue);
}

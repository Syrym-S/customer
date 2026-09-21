export function pluralizeRu(count, forms) {
   const [one, few, many] = forms;
   const number = Math.abs(Math.trunc(Number(count)));

   if (Number.isNaN(number)) {
      return many;
   }

   const mod10 = number % 10;
   const mod100 = number % 100;

   if (mod10 === 1 && mod100 !== 11) {
      return one;
   }

   if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
      return few;
   }

   return many;
}

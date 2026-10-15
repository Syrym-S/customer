function stripLeadingZeros(integerPart) {
   return integerPart.replace(/^0+(?=\d)/, '');
}

export function sanitizeDecimalInput(value, decimals = 2) {
   const cleaned = String(value ?? '')
      .replace(',', '.')
      .replace(/[^\d.]/g, '');

   if (!cleaned) {
      return '';
   }

   if (decimals <= 0) {
      return stripLeadingZeros(cleaned.split('.')[0]);
   }

   const [integerPart, ...restParts] = cleaned.split('.');
   const fractionPart = restParts.join('').slice(0, decimals);
   const normalizedInteger = stripLeadingZeros(integerPart) || '0';

   if (!cleaned.includes('.')) {
      return normalizedInteger;
   }

   return `${normalizedInteger}.${fractionPart}`;
}

export function sanitizeIntegerInput(value) {
   return sanitizeDecimalInput(value, 0);
}

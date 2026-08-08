export function formatCompactEmail(email, maxLocalPartLength = 14) {
   const normalizedEmail = String(email ?? '').trim();

   if (!normalizedEmail) {
      return '';
   }

   const separatorIndex = normalizedEmail.lastIndexOf('@');

   if (separatorIndex <= 0 || separatorIndex === normalizedEmail.length - 1) {
      return normalizedEmail.length > 28
         ? `${normalizedEmail.slice(0, 24)}…`
         : normalizedEmail;
   }

   const localPart = normalizedEmail.slice(0, separatorIndex);
   const domainPart = normalizedEmail.slice(separatorIndex + 1);

   const compactLocalPart =
      localPart.length > maxLocalPartLength
         ? `${localPart.slice(0, maxLocalPartLength)}…`
         : localPart;

   return `${compactLocalPart}@${domainPart}`;
}

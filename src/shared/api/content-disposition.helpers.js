const FILENAME_STAR_PATTERN = /filename\*\s*=\s*([^;]+)/i;
const FILENAME_PATTERN = /filename\s*=\s*("([^"]*)"|[^;]*)/i;

function decodeExtendedValue(value) {
   const raw = String(value || '').trim();
   const parts = raw.split("'");
   const encoded = parts.length >= 3 ? parts.slice(2).join("'") : raw;

   try {
      return decodeURIComponent(encoded);
   } catch {
      return encoded;
   }
}

export function getFileNameFromHeaders(headers, fallbackName = '') {
   const header =
      headers?.['content-disposition'] ??
      headers?.['Content-Disposition'] ??
      (typeof headers?.get === 'function'
         ? headers.get('content-disposition')
         : '');

   const disposition = String(header || '');

   if (!disposition) {
      return fallbackName;
   }

   const starMatch = disposition.match(FILENAME_STAR_PATTERN);

   if (starMatch) {
      const decoded = decodeExtendedValue(starMatch[1]).trim();

      if (decoded) {
         return decoded;
      }
   }

   const plainMatch = disposition.match(FILENAME_PATTERN);

   if (plainMatch) {
      const decoded = (plainMatch[2] ?? plainMatch[1] ?? '').trim();

      if (decoded) {
         return decoded;
      }
   }

   return fallbackName;
}

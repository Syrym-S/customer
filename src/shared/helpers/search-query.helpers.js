export function parseSearchQuery(value) {
   const tokens = String(value ?? '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

   let num = '';
   const textTokens = [];

   for (const token of tokens) {
      const digits = token.replace(/^[№#]+/, '');

      if (!num && /^\d+$/.test(digits)) {
         num = digits;
         continue;
      }

      textTokens.push(token);
   }

   return { num, text: textTokens.join(' ') };
}

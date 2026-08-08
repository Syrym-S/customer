export function normalizeLocationValue(value) {
   if (value === null || value === undefined) {
      return '';
   }

   if (typeof value === 'string') {
      return value.trim();
   }

   if (typeof value === 'number') {
      return Number.isFinite(value) ? String(value) : '';
   }

   if (typeof value !== 'object' || Array.isArray(value)) {
      return '';
   }

   const fullAddressKeys = [
      'fullAddress',
      'full_address',
      'formattedAddress',
      'formatted_address',
   ];

   for (const key of fullAddressKeys) {
      const fieldValue = value[key];

      if (typeof fieldValue === 'string' && fieldValue.trim()) {
         return fieldValue.trim();
      }
   }

   const locationParts = [
      value.country,
      value.region,
      value.city,
      value.address,
   ]
      .filter((part) => typeof part === 'string')
      .map((part) => part.trim())
      .filter(Boolean);

   const uniqueLocationParts = [...new Set(locationParts)];

   if (uniqueLocationParts.length > 0) {
      return uniqueLocationParts.join(', ');
   }

   const fallbackKeys = [
      'address',
      'location',
      'name',
      'title',
      'label',
      'value',
   ];

   for (const key of fallbackKeys) {
      const fieldValue = value[key];

      if (typeof fieldValue === 'string' && fieldValue.trim()) {
         return fieldValue.trim();
      }
   }

   return '';
}

export function formatLocation(value, fallback = '') {
   return normalizeLocationValue(value) || fallback;
}

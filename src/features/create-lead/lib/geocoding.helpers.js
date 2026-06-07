export function formatCoordinatesLabel(lat, lng) {
   return `Координаты: ${lat}, ${lng}`;
}

export function formatNominatimAddress(data) {
   const address = data?.address;

   if (!address) {
      return data?.display_name || 'Адрес не найден';
   }

   const city =
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      address.county;

   const region =
      address.state ||
      address.region ||
      address.state_district ||
      address.county;

   const country = address.country;

   const parts = [city, region, country].filter(Boolean);

   if (parts.length === 0) {
      return data?.display_name || 'Адрес не найден';
   }

   return [...new Set(parts)].join(', ');
}

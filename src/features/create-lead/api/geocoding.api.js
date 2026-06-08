import {
   formatCoordinatesLabel,
   formatNominatimAddress,
} from '../lib/geocoding.helpers';

export async function reverseGeocode(lat, lng, options = {}) {
   try {
      const url = new URL('https://nominatim.openstreetmap.org/reverse');

      url.searchParams.set('format', 'jsonv2');
      url.searchParams.set('lat', lat);
      url.searchParams.set('lon', lng);
      url.searchParams.set('addressdetails', '1');
      url.searchParams.set('accept-language', 'ru');

      const response = await fetch(url.toString(), {
         signal: options.signal,
      });

      if (!response.ok) {
         throw new Error('Reverse geocoding failed');
      }

      const data = await response.json();

      return formatNominatimAddress(data);
   } catch (error) {
      if (error.name === 'AbortError') {
         throw error;
      }

      console.error(error);
      return formatCoordinatesLabel(lat, lng);
   }
}

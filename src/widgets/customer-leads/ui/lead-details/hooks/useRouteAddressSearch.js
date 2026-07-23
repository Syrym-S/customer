import { useEffect, useState } from 'react';
import { searchGeocode } from '../../../../../features/create-lead/api/geocoding.api';

export function useRouteAddressSearch({ inputValue, currentValue }) {
   const [options, setOptions] = useState([]);
   const [isLoading, setIsLoading] = useState(false);

   useEffect(() => {
      const query = inputValue.trim();

      if (query.length < 2 || query === currentValue) {
         setOptions([]);
         return;
      }

      const controller = new AbortController();

      const timeoutId = setTimeout(async () => {
         try {
            setIsLoading(true);

            const result = await searchGeocode(query, {
               signal: controller.signal,
            });

            setOptions(result);
         } catch (error) {
            if (error.name !== 'AbortError') {
               console.error(error);
               setOptions([]);
            }
         } finally {
            setIsLoading(false);
         }
      }, 300);

      return () => {
         controller.abort();
         clearTimeout(timeoutId);
      };
   }, [inputValue, currentValue]);

   return {
      options,
      setOptions,
      isLoading,
   };
}

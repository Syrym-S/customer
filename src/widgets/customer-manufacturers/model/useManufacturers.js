import { useCallback, useEffect, useState } from 'react';

import {
   fetchMyManufacturers,
   searchManufacturers,
} from '../api/manufacturers.repository';
import { normalizeManufacturersResponse } from './manufacturers.helpers';

export function useMyManufacturers() {
   const [manufacturers, setManufacturers] = useState([]);
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState('');

   const loadManufacturers = useCallback(async () => {
      try {
         setIsLoading(true);
         setError('');

         const response = await fetchMyManufacturers();

         setManufacturers(normalizeManufacturersResponse(response));
      } catch (requestError) {
         setError(
            requestError.response?.data?.message ||
               requestError.message ||
               'Не удалось загрузить производителей',
         );
      } finally {
         setIsLoading(false);
      }
   }, []);

   useEffect(() => {
      loadManufacturers();
   }, [loadManufacturers]);

   return {
      manufacturers,
      isLoading,
      error,
      reloadManufacturers: loadManufacturers,
   };
}

const SEARCH_DEBOUNCE_MS = 450;

export function useManufacturersSearch(query) {
   const [results, setResults] = useState([]);
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState('');

   useEffect(() => {
      const normalizedQuery = String(query ?? '').trim();

      if (!normalizedQuery) {
         setResults([]);
         setError('');
         setIsLoading(false);

         return undefined;
      }

      let isCancelled = false;

      const timeoutId = window.setTimeout(async () => {
         try {
            setIsLoading(true);
            setError('');

            const response = await searchManufacturers(normalizedQuery);

            if (!isCancelled) {
               setResults(normalizeManufacturersResponse(response));
            }
         } catch (requestError) {
            if (!isCancelled) {
               setResults([]);
               setError(
                  requestError.response?.data?.message ||
                     requestError.message ||
                     'Не удалось выполнить поиск производителей',
               );
            }
         } finally {
            if (!isCancelled) {
               setIsLoading(false);
            }
         }
      }, SEARCH_DEBOUNCE_MS);

      return () => {
         isCancelled = true;
         window.clearTimeout(timeoutId);
      };
   }, [query]);

   return { results, isLoading, error };
}

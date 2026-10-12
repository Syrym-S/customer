import { useCallback, useEffect, useRef, useState } from 'react';

import {
   notificationDomainEventNames,
   subscribeToNotificationDomainEvent,
} from '../../../shared/model/notification-domain-events';
import { fetchLeadsAnalytics } from '../api/analytics.repository';
import { mapAnalyticsResponseFromApi } from './analytics.adapter';

const REFETCH_DEBOUNCE_MS = 400;
const LOAD_ERROR_MESSAGE = 'Не удалось загрузить аналитику перевозок';

const REFRESH_EVENT_NAMES = [
   notificationDomainEventNames.leadsChanged,
   notificationDomainEventNames.shippingChanged,
];

export function useLeadsAnalytics({ period, from, to, groupBy, page, perPage }) {
   const [data, setData] = useState(null);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState(null);

   const requestIdRef = useRef(0);

   const loadAnalytics = useCallback(
      async ({ silent = false } = {}) => {
         requestIdRef.current += 1;
         const requestId = requestIdRef.current;

         if (!silent) {
            setError(null);
            setIsLoading(true);
         }

         try {
            const response = await fetchLeadsAnalytics({
               period,
               from,
               to,
               groupBy,
               page,
               perPage,
            });

            if (requestId !== requestIdRef.current) {
               return;
            }

            setData(mapAnalyticsResponseFromApi(response));
            setError(null);
         } catch {
            if (requestId !== requestIdRef.current) {
               return;
            }

            setError(LOAD_ERROR_MESSAGE);
         } finally {
            if (requestId === requestIdRef.current) {
               setIsLoading(false);
            }
         }
      },
      [period, from, to, groupBy, page, perPage],
   );

   const retry = useCallback(() => {
      loadAnalytics();
   }, [loadAnalytics]);

   useEffect(() => {
      loadAnalytics();

      return () => {
         requestIdRef.current += 1;
      };
   }, [loadAnalytics]);

   useEffect(() => {
      let timeoutId = null;

      function scheduleSilentReload() {
         window.clearTimeout(timeoutId);
         timeoutId = window.setTimeout(() => {
            loadAnalytics({ silent: true });
         }, REFETCH_DEBOUNCE_MS);
      }

      const unsubscribers = REFRESH_EVENT_NAMES.map((eventName) =>
         subscribeToNotificationDomainEvent(eventName, scheduleSilentReload),
      );

      return () => {
         window.clearTimeout(timeoutId);
         unsubscribers.forEach((unsubscribe) => unsubscribe());
      };
   }, [loadAnalytics]);

   return { data, isLoading, error, retry };
}

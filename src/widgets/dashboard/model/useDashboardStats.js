import { useCallback, useEffect, useRef, useState } from 'react';

import {
   notificationDomainEventNames,
   subscribeToNotificationDomainEvent,
} from '../../../shared/model/notification-domain-events';
import { customerStatsConfig } from './stats.config';

const REFETCH_DEBOUNCE_MS = 400;
const LOAD_ERROR_MESSAGE = 'Не удалось загрузить статистику';

const REFRESH_EVENT_NAMES = [
   notificationDomainEventNames.leadsChanged,
   notificationDomainEventNames.tendersChanged,
   notificationDomainEventNames.factoringsChanged,
   notificationDomainEventNames.shippingChanged,
];

export function useDashboardStats(period, config = customerStatsConfig) {
   const [data, setData] = useState(null);
   const [isLoading, setIsLoading] = useState(true);
   const [isRefreshing, setIsRefreshing] = useState(false);
   const [error, setError] = useState(null);

   const requestIdRef = useRef(0);
   const hasDataRef = useRef(false);

   const loadStats = useCallback(
      async ({ silent = false } = {}) => {
         requestIdRef.current += 1;
         const requestId = requestIdRef.current;

         if (!silent) {
            setError(null);

            if (hasDataRef.current) {
               setIsRefreshing(true);
            } else {
               setIsLoading(true);
            }
         }

         try {
            const response = await config.fetchStats({ period });

            if (requestId !== requestIdRef.current) {
               return;
            }

            hasDataRef.current = true;
            setData(config.mapResponse(response));
            setError(null);
         } catch {
            if (requestId !== requestIdRef.current) {
               return;
            }

            if (!silent) {
               setError(LOAD_ERROR_MESSAGE);
            }
         } finally {
            if (requestId === requestIdRef.current) {
               setIsLoading(false);
               setIsRefreshing(false);
            }
         }
      },
      [period, config],
   );

   const retry = useCallback(() => {
      loadStats();
   }, [loadStats]);

   useEffect(() => {
      loadStats();

      return () => {
         requestIdRef.current += 1;
      };
   }, [loadStats]);

   useEffect(() => {
      let timeoutId = null;

      function scheduleSilentReload() {
         window.clearTimeout(timeoutId);
         timeoutId = window.setTimeout(() => {
            loadStats({ silent: true });
         }, REFETCH_DEBOUNCE_MS);
      }

      const unsubscribers = REFRESH_EVENT_NAMES.map((eventName) =>
         subscribeToNotificationDomainEvent(eventName, scheduleSilentReload),
      );

      return () => {
         window.clearTimeout(timeoutId);
         unsubscribers.forEach((unsubscribe) => unsubscribe());
      };
   }, [loadStats]);

   return { data, isLoading, isRefreshing, error, retry };
}

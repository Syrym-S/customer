import { useCallback, useEffect, useRef, useState } from 'react';

import {
   notificationDomainEventNames,
   subscribeToNotificationDomainEvent,
} from '../../../shared/model/notification-domain-events';
import { customerStatsConfig } from './stats.config';
import { isSameStatsPeriod } from './stats.helpers';

const REFETCH_DEBOUNCE_MS = 400;
const LOAD_ERROR_MESSAGE = 'Не удалось загрузить статистику';

const REFRESH_EVENT_NAMES = [
   notificationDomainEventNames.leadsChanged,
   notificationDomainEventNames.tendersChanged,
   notificationDomainEventNames.factoringsChanged,
   notificationDomainEventNames.shippingChanged,
];

const IDLE_REFRESHING_SECTIONS = {
   leadsPeriod: false,
   factoringsPeriod: false,
};

export function useDashboardStats(
   { leadsPeriod, factoringsPeriod },
   config = customerStatsConfig,
) {
   const [data, setData] = useState(null);
   const [isLoading, setIsLoading] = useState(true);
   const [refreshingSections, setRefreshingSections] = useState(
      IDLE_REFRESHING_SECTIONS,
   );
   const [error, setError] = useState(null);

   const requestIdRef = useRef(0);
   const hasDataRef = useRef(false);
   const loadedPeriodsRef = useRef(null);

   const loadStats = useCallback(
      async ({ silent = false } = {}) => {
         requestIdRef.current += 1;
         const requestId = requestIdRef.current;

         if (!silent) {
            setError(null);

            if (hasDataRef.current) {
               const loadedPeriods = loadedPeriodsRef.current;

               setRefreshingSections((current) => ({
                  leadsPeriod:
                     current.leadsPeriod ||
                     !isSameStatsPeriod(loadedPeriods?.leadsPeriod, leadsPeriod),
                  factoringsPeriod:
                     current.factoringsPeriod ||
                     !isSameStatsPeriod(
                        loadedPeriods?.factoringsPeriod,
                        factoringsPeriod,
                     ),
               }));
            } else {
               setIsLoading(true);
            }
         }

         try {
            const response = await config.fetchStats({
               leadsPeriod,
               factoringsPeriod,
            });

            if (requestId !== requestIdRef.current) {
               return;
            }

            hasDataRef.current = true;
            loadedPeriodsRef.current = { leadsPeriod, factoringsPeriod };
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
               setRefreshingSections(IDLE_REFRESHING_SECTIONS);
            }
         }
      },
      [leadsPeriod, factoringsPeriod, config],
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

   const isRefreshing =
      refreshingSections.leadsPeriod || refreshingSections.factoringsPeriod;

   return { data, isLoading, isRefreshing, refreshingSections, error, retry };
}

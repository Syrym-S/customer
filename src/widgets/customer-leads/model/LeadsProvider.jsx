import PropTypes from 'prop-types';
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchCustomerLeads } from '../api/leads.repository';
import { mapLeadsResponseFromApi } from './lead.adapter';
import { isDraftLead } from './lead.helpers';
import { LeadsContext } from './LeadsContext';
import { leadsScopes } from './leads-scope.constants';
import {
   notificationDomainEventNames,
   subscribeToNotificationDomainEvent,
} from '../../../shared/model/notification-domain-events';

const DEFAULT_PER_PAGE = 10;
const SEARCH_DEBOUNCE_MS = 450;

function sortLeadsWithDraftsFirst(leads) {
   return [...leads].sort((a, b) => {
      const draftRank = (lead) => (isDraftLead(lead) ? 0 : 1);

      return draftRank(a) - draftRank(b);
   });
}

// The orders page opens on the full list, while the dashboard shows an
// "active orders" block — hence the scope is the mount's choice, not a default
// baked into the provider.
export function LeadsProvider({ children, initialScope = leadsScopes.ALL }) {
   const { t } = useTranslation();

   const [leads, setLeads] = useState([]);
   const [openLead, setOpenLead] = useState(null);

   const [page, setPage] = useState(1);
   const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
   const [count, setCount] = useState(0);
   const [status, setStatus] = useState('');
   const [scope, setScope] = useState(initialScope);

   const [search, setSearch] = useState('');
   const [debouncedSearch, setDebouncedSearch] = useState('');

   const [num, setNum] = useState('');
   const [debouncedNum, setDebouncedNum] = useState('');

   const [dateFrom, setDateFrom] = useState('');
   const [dateTo, setDateTo] = useState('');

   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState(null);

   const isDateRangeValid = !dateFrom || !dateTo || dateFrom <= dateTo;
   const appliedDateFrom = isDateRangeValid ? dateFrom : '';
   const appliedDateTo = isDateRangeValid ? dateTo : '';

   const loadLeads = useCallback(
      async ({ withLoader = true } = {}) => {
         try {
            if (withLoader) {
               setIsLoading(true);
            }

            setError(null);

            const response = await fetchCustomerLeads({
               page,
               perPage,
               status,
               search: debouncedSearch,
               num: debouncedNum,
               dateFrom: appliedDateFrom,
               dateTo: appliedDateTo,
               scope,
            });
            const mappedResponse = mapLeadsResponseFromApi(response);

            setLeads(sortLeadsWithDraftsFirst(mappedResponse.leads));
            setCount(mappedResponse.count);
            setPerPage(mappedResponse.perPage);
         } catch (requestError) {
            setError(requestError.message || t("leads.loadFailed"));
         } finally {
            if (withLoader) {
               setIsLoading(false);
            }
         }
      },
      [
         page,
         perPage,
         status,
         debouncedSearch,
         debouncedNum,
         appliedDateFrom,
         appliedDateTo,
         scope,
         t,
      ],
   );

   const setStatusFilter = useCallback((nextStatus) => {
      setStatus(nextStatus);
      setPage(1);
   }, []);

   const setScopeFilter = useCallback((nextScope) => {
      setScope(nextScope);
      setPage(1);

      if (nextScope !== leadsScopes.ALL) {
         setNum('');
         setDebouncedNum('');
         setDateFrom('');
         setDateTo('');
      }
   }, []);

   const setDateFromFilter = useCallback((nextDateFrom) => {
      setDateFrom(nextDateFrom);
      setPage(1);
   }, []);

   const setDateToFilter = useCallback((nextDateTo) => {
      setDateTo(nextDateTo);
      setPage(1);
   }, []);

   const resetFilters = useCallback(() => {
      setSearch('');
      setDebouncedSearch('');
      setNum('');
      setDebouncedNum('');
      setDateFrom('');
      setDateTo('');
      setPage(1);
   }, []);

   const prependLead = useCallback(
      (lead) => {
         if (!lead) {
            return;
         }

         setLeads((prevLeads) => [lead, ...prevLeads].slice(0, perPage));
         setCount((prevCount) => prevCount + 1);
      },
      [perPage],
   );

   useEffect(() => {
      const timeoutId = window.setTimeout(() => {
         setDebouncedSearch(search.trim());
         setPage(1);
      }, SEARCH_DEBOUNCE_MS);

      return () => {
         window.clearTimeout(timeoutId);
      };
   }, [search]);

   useEffect(() => {
      const timeoutId = window.setTimeout(() => {
         setDebouncedNum(num.trim());
         setPage(1);
      }, SEARCH_DEBOUNCE_MS);

      return () => {
         window.clearTimeout(timeoutId);
      };
   }, [num]);

   useEffect(() => {
      loadLeads({ withLoader: true });
   }, [loadLeads]);

   useEffect(() => {
      function handleLeadsRelatedEvent() {
         loadLeads({ withLoader: false });
      }

      const unsubscribeLeads = subscribeToNotificationDomainEvent(
         notificationDomainEventNames.leadsChanged,
         handleLeadsRelatedEvent,
      );
      const unsubscribeShipping = subscribeToNotificationDomainEvent(
         notificationDomainEventNames.shippingChanged,
         handleLeadsRelatedEvent,
      );

      return () => {
         unsubscribeLeads();
         unsubscribeShipping();
      };
   }, [loadLeads]);

   const value = useMemo(
      () => ({
         leads,
         openLead,
         setOpenLead,

         page,
         setPage,
         perPage,
         setPerPage,
         count,
         status,
         setStatusFilter,

         scope,
         setScopeFilter,

         search,
         setSearch,

         num,
         setNum,

         dateFrom,
         setDateFrom: setDateFromFilter,
         dateTo,
         setDateTo: setDateToFilter,
         isDateRangeValid,

         resetFilters,

         isLoading,
         error,

         reloadLeads: loadLeads,
         prependLead,
      }),
      [
         leads,
         openLead,
         page,
         perPage,
         count,
         status,
         setStatusFilter,
         scope,
         setScopeFilter,
         search,
         num,
         dateFrom,
         dateTo,
         isDateRangeValid,
         setDateFromFilter,
         setDateToFilter,
         resetFilters,
         isLoading,
         error,
         loadLeads,
         prependLead,
      ],
   );

   return (
      <LeadsContext.Provider value={value}>{children}</LeadsContext.Provider>
   );
}

LeadsProvider.propTypes = {
   children: PropTypes.node.isRequired,
   initialScope: PropTypes.oneOf(Object.values(leadsScopes)),
};

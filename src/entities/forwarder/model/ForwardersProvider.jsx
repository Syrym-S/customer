import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
   createForwarder as createForwarderApi,
   fetchForwarderById,
   fetchForwarders,
   searchForwarders,
} from '../api/forwarders.api';
import { FORWARDERS_PER_PAGE, FORWARDERS_VIEW_MODES } from './forwarder.constants';
import {
   getForwarderId,
   normalizeForwardersListResponse,
} from './forwarder.helpers';
import { ForwardersContext } from './ForwardersContext';

const SEARCH_DEBOUNCE_MS = 450;

export function ForwardersProvider({ children }) {
   const [forwarders, setForwarders] = useState([]);

   const [page, setPage] = useState(1);
   const [total, setTotal] = useState(0);

   const [search, setSearch] = useState('');
   const [debouncedSearch, setDebouncedSearch] = useState('');

   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState('');

   const [selectedForwarder, setSelectedForwarder] = useState(null);
   const [isDetailsOpen, setIsDetailsOpen] = useState(false);
   const [isDetailsLoading, setIsDetailsLoading] = useState(false);
   const [detailsError, setDetailsError] = useState('');
   const [viewMode, setViewMode] = useState(FORWARDERS_VIEW_MODES.TABLE);

   const [isCreateOpen, setIsCreateOpen] = useState(false);
   const [isCreating, setIsCreating] = useState(false);
   const [createError, setCreateError] = useState('');
   const [createdInvite, setCreatedInvite] = useState(null);

   const isSearchMode = Boolean(debouncedSearch.trim());

   const pageCount = useMemo(
      () => Math.max(1, Math.ceil(total / FORWARDERS_PER_PAGE)),
      [total],
   );

   const loadForwarders = useCallback(async () => {
      try {
         setIsLoading(true);
         setError('');

         if (isSearchMode) {
            const searchResults = await searchForwarders(debouncedSearch);

            const nextForwarders = Array.isArray(searchResults)
               ? searchResults
               : [];

            setForwarders(nextForwarders);
            setTotal(nextForwarders.length);
            return;
         }

         const response = await fetchForwarders({
            page,
            perPage: FORWARDERS_PER_PAGE,
         });

         const mappedResponse = normalizeForwardersListResponse(response);

         setForwarders(mappedResponse.forwarders);
         setTotal(mappedResponse.total);
      } catch (requestError) {
         setError(
            requestError.response?.data?.message ||
               requestError.response?.data?.error ||
               requestError.message ||
               'Не удалось загрузить экспедиторов',
         );
      } finally {
         setIsLoading(false);
      }
   }, [debouncedSearch, isSearchMode, page]);

   const openForwarderDetails = useCallback(async (forwarder) => {
      const forwarderId = getForwarderId(forwarder);

      if (!forwarderId) {
         return;
      }

      try {
         setIsDetailsOpen(true);
         setSelectedForwarder(forwarder);
         setDetailsError('');
         setIsDetailsLoading(true);

         const details = await fetchForwarderById(forwarderId);

         setSelectedForwarder(details || forwarder);
      } catch (requestError) {
         setDetailsError(
            requestError.response?.data?.message ||
               requestError.response?.data?.error ||
               requestError.message ||
               'Не удалось загрузить данные экспедитора',
         );
      } finally {
         setIsDetailsLoading(false);
      }
   }, []);

   const closeForwarderDetails = useCallback(() => {
      setIsDetailsOpen(false);
      setSelectedForwarder(null);
      setDetailsError('');
   }, []);

   const openCreateForwarder = useCallback(() => {
      setIsCreateOpen(true);
      setCreateError('');
      setCreatedInvite(null);
   }, []);

   const closeCreateForwarder = useCallback(() => {
      setIsCreateOpen(false);
      setCreateError('');
      setCreatedInvite(null);
   }, []);

   const createForwarder = useCallback(
      async (payload) => {
         try {
            setIsCreating(true);
            setCreateError('');

            const response = await createForwarderApi(payload);

            setCreatedInvite(response);

            await loadForwarders();
         } catch (requestError) {
            setCreateError(
               requestError.response?.data?.message ||
                  requestError.response?.data?.error ||
                  requestError.message ||
                  'Не удалось создать приглашение',
            );
         } finally {
            setIsCreating(false);
         }
      },
      [loadForwarders],
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
      loadForwarders();
   }, [loadForwarders]);

   const value = useMemo(
      () => ({
         forwarders,

         page,
         setPage,
         total,
         pageCount,

         search,
         setSearch,
         isSearchMode,

         isLoading,
         error,

         selectedForwarder,
         isDetailsOpen,
         isDetailsLoading,
         detailsError,
         openForwarderDetails,
         closeForwarderDetails,

         viewMode,
         setViewMode,

         isCreateOpen,
         isCreating,
         createError,
         createdInvite,
         openCreateForwarder,
         closeCreateForwarder,
         createForwarder,

         reloadForwarders: loadForwarders,
      }),
      [
         forwarders,
         page,
         total,
         pageCount,
         search,
         isSearchMode,
         isLoading,
         error,
         selectedForwarder,
         isDetailsOpen,
         isDetailsLoading,
         detailsError,
         openForwarderDetails,
         closeForwarderDetails,
         viewMode,
         isCreateOpen,
         isCreating,
         createError,
         createdInvite,
         openCreateForwarder,
         closeCreateForwarder,
         createForwarder,
         loadForwarders,
      ],
   );

   return (
      <ForwardersContext.Provider value={value}>
         {children}
      </ForwardersContext.Provider>
   );
}

ForwardersProvider.propTypes = {
   children: PropTypes.node.isRequired,
};

import { useCallback, useEffect, useMemo, useState } from 'react';
import { TendersContext } from './TendersContext';
import PropTypes from 'prop-types';
import {
   acceptTenderBet,
   addTenderParticipant,
   cancelCustomerTender,
   createCustomerTender,
   deleteCustomerTender,
   deleteTenderParticipant,
   fetchCustomerTenderById,
   fetchCustomerTenders,
   fetchTenderLeadFiles,
   startCustomerTender,
   updateCustomerTender,
} from '../api/tender.api';
import {
   mapTenderFromApi,
   mapTenderLeadDocumentsResponseFromApi,
   mapTendersListFromApi,
} from './tender.adapter';

export function TendersProvider({ children }) {
   const [tenders, setTenders] = useState([]);
   const [openTender, setOpenTender] = useState(null);

   const [page, setPage] = useState(1);
   const [limit, setLimit] = useState(10);
   const [status, setStatus] = useState('all');
   const [total, setTotal] = useState(0);

   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState('');

   const [isDetailsLoading, setIsDetailsLoading] = useState(false);
   const [detailsError, setDetailsError] = useState('');

   const loadTenders = useCallback(async () => {
      try {
         setIsLoading(true);
         setError('');

         const response = await fetchCustomerTenders({ page, limit, status });
         const mappedResponse = mapTendersListFromApi(response);

         setTenders(mappedResponse.tenders);
         setTotal(mappedResponse.total);
      } catch (error) {
         setError(
            error.response?.data?.message ||
               error.message ||
               'Не удалось загрузить тендеры',
         );
         setTenders([]);
         setTotal(0);
      } finally {
         setIsLoading(false);
      }
   }, [page, limit, status]);

   const createTender = useCallback(async (payload) => {
      return createCustomerTender(payload);
   }, []);

   const addParticipant = useCallback(async (tenderId, participantId) => {
      return addTenderParticipant(tenderId, participantId);
   }, []);

   const loadTenderDetailsWithFiles = useCallback(async (tenderId) => {
      const tender = await fetchCustomerTenderById(tenderId);

      if (!tender?.lead?.id) {
         return tender;
      }

      try {
         const filesResponse = await fetchTenderLeadFiles(tender.lead.id);
         const documents = mapTenderLeadDocumentsResponseFromApi(filesResponse);

         return {
            ...tender,
            lead: {
               ...tender.lead,
               documents,
               files: documents,
            },
         };
      } catch (error) {
         console.error('Не удалось загрузить файлы лида:', error);

         return {
            ...tender,
            lead: {
               ...tender.lead,
               documents: [],
               files: [],
            },
         };
      }
   }, []);

   const openTenderDetails = useCallback(
      async (tender) => {
         if (!tender?.id) {
            return;
         }

         try {
            setOpenTender(tender);
            setIsDetailsLoading(true);
            setDetailsError('');

            const response = await loadTenderDetailsWithFiles(tender.id);
            const mappedTender = mapTenderFromApi(response);

            setOpenTender(mappedTender);
         } catch (error) {
            setDetailsError(
               error.response?.data?.message ||
                  error.message ||
                  'Не удалось загрузить детали тендера',
            );
         } finally {
            setIsDetailsLoading(false);
         }
      },
      [loadTenderDetailsWithFiles],
   );

   const closeTenderDetails = useCallback(async () => {
      setOpenTender(null);
      setDetailsError('');
   }, []);

   const deleteTender = useCallback(
      async (tenderId) => {
         await deleteCustomerTender(tenderId);
         closeTenderDetails();
         await loadTenders();
      },
      [closeTenderDetails, loadTenders],
   );

   const cancelTender = useCallback(
      async (tenderId) => {
         await cancelCustomerTender(tenderId);

         const response = await fetchCustomerTenderById(tenderId);
         const mappedTender = mapTenderFromApi(response);

         setOpenTender(mappedTender);
         await loadTenders();
      },
      [loadTenders],
   );

   const refreshTenderDetails = useCallback(
      async (tenderId) => {
         const response = await loadTenderDetailsWithFiles(tenderId);
         const mappedTender = mapTenderFromApi(response);

         setOpenTender(mappedTender);

         return mappedTender;
      },
      [loadTenderDetailsWithFiles],
   );

   const startTender = useCallback(
      async (tenderId) => {
         await startCustomerTender(tenderId);
         await refreshTenderDetails(tenderId);
         await loadTenders();
      },
      [refreshTenderDetails, loadTenders],
   );

   const updateTender = useCallback(
      async (tenderId, payload) => {
         await updateCustomerTender(tenderId, payload);
         await refreshTenderDetails(tenderId);
         await loadTenders();
      },
      [refreshTenderDetails, loadTenders],
   );

   const acceptBet = useCallback(
      async (tenderId, betIndex) => {
         await acceptTenderBet(tenderId, betIndex);
         await refreshTenderDetails(tenderId);
         await loadTenders();
      },
      [refreshTenderDetails, loadTenders],
   );

   const removeParticipant = useCallback(
      async (tenderId, participantId) => {
         await deleteTenderParticipant(tenderId, participantId);
         await refreshTenderDetails(tenderId);
         await loadTenders();
      },
      [refreshTenderDetails, loadTenders],
   );

   useEffect(() => {
      loadTenders();
   }, [loadTenders]);

   const value = useMemo(
      () => ({
         tenders,
         openTender,
         setOpenTender,
         openTenderDetails,
         closeTenderDetails,

         page,
         setPage,
         limit,
         setLimit,
         status,
         setStatus,
         total,

         isLoading,
         error,

         createTender,
         addParticipant,
         acceptBet,
         removeParticipant,

         addTenderParticipant,
         createCustomerTender,

         refreshTenderDetails,
         isDetailsLoading,
         detailsError,

         startTender,
         updateTender,

         reloadTenders: loadTenders,
         deleteTender,
         cancelTender,
      }),
      [
         tenders,
         openTender,
         openTenderDetails,
         closeTenderDetails,
         page,
         limit,
         status,
         total,
         isLoading,
         error,
         startTender,
         updateTender,
         isDetailsLoading,
         detailsError,
         loadTenders,
         deleteTender,
         cancelTender,
         createTender,
         addParticipant,
         acceptBet,
         refreshTenderDetails,
         removeParticipant,
      ],
   );

   return (
      <TendersContext.Provider value={value}>
         {children}
      </TendersContext.Provider>
   );
}

TendersProvider.propTypes = {
   children: PropTypes.node.isRequired,
};

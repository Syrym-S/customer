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
import {
   notificationDomainEventNames,
   subscribeToNotificationDomainEvent,
} from '../../../shared/model/notification-domain-events';

const DEFAULT_PER_PAGE = 2;

export function TendersProvider({ children }) {
   const [tenders, setTenders] = useState([]);
   const [openTender, setOpenTender] = useState(null);

   const [page, setPage] = useState(1);
   const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
   const [status, setStatus] = useState('all');
   const [count, setCount] = useState(0);

   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState('');

   const [isDetailsLoading, setIsDetailsLoading] = useState(false);
   const [detailsError, setDetailsError] = useState('');

   const loadTenders = useCallback(
      async ({ withLoader = true } = {}) => {
         try {
            if (withLoader) {
               setIsLoading(true);
            }

            setError('');

            const response = await fetchCustomerTenders({
               page,
               limit: perPage,
               status,
            });

            const mappedResponse = mapTendersListFromApi(response);

            setTenders(mappedResponse.tenders);
            setCount(mappedResponse.count);
            setPerPage(mappedResponse.perPage);
         } catch (error) {
            setError(
               error.response?.data?.message ||
                  error.message ||
                  'Не удалось загрузить тендеры',
            );
         } finally {
            if (withLoader) {
               setIsLoading(false);
            }
         }
      },
      [page, perPage, status],
   );

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

   const refreshTenderDetails = useCallback(
      async (tenderId) => {
         const response = await loadTenderDetailsWithFiles(tenderId);
         const mappedTender = mapTenderFromApi(response);

         setOpenTender(mappedTender);

         return mappedTender;
      },
      [loadTenderDetailsWithFiles],
   );

   const createTender = useCallback(async (payload) => {
      return createCustomerTender(payload);
   }, []);

   const addParticipant = useCallback(async (tenderId, participantId) => {
      return addTenderParticipant(tenderId, participantId);
   }, []);

   const addParticipantsToTender = useCallback(
      async (tenderId, participantIds) => {
         const uniqueParticipantIds = [...new Set(participantIds)].filter(
            Boolean,
         );

         if (!tenderId || uniqueParticipantIds.length === 0) {
            return;
         }

         await Promise.all(
            uniqueParticipantIds.map((participantId) =>
               addTenderParticipant(tenderId, participantId),
            ),
         );

         await refreshTenderDetails(tenderId);
         await loadTenders();
      },
      [refreshTenderDetails, loadTenders],
   );

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
      async (tenderId, participantIndex) => {
         await deleteTenderParticipant(tenderId, participantIndex);
         await refreshTenderDetails(tenderId);
         await loadTenders();
      },
      [refreshTenderDetails, loadTenders],
   );

   useEffect(() => {
      loadTenders({ withLoader: true });
   }, [loadTenders]);

   useEffect(() => {
      return subscribeToNotificationDomainEvent(
         notificationDomainEventNames.tendersChanged,
         () => {
            loadTenders({ withLoader: false });

            if (openTender?.id) {
               refreshTenderDetails(openTender.id).catch((error) => {
                  console.error(
                     'Не удалось обновить детали тендера после уведомления:',
                     error,
                  );
               });
            }
         },
      );
   }, [loadTenders, openTender?.id, refreshTenderDetails]);

   const value = useMemo(
      () => ({
         tenders,
         openTender,
         setOpenTender,
         openTenderDetails,
         closeTenderDetails,

         page,
         setPage,
         perPage,
         setPerPage,
         status,
         setStatus,
         count,

         isLoading,
         error,

         createTender,
         addParticipant,
         addParticipantsToTender,
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
         perPage,
         status,
         count,
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
         addParticipantsToTender,
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

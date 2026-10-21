import { useCallback, useEffect, useState } from 'react';

import {
   approveManufacturerRequest,
   attachManufacturer,
   detachManufacturer,
   fetchManufacturerRequests,
   rejectManufacturerRequest,
} from '../api/manufacturers.repository';
import {
   notifyError,
   notifySuccess,
} from '../../../shared/model/notifications.store';
import { pluralizeRu } from '../../../shared/helpers/plural.helpers';
import { normalizeManufacturerRequestsResponse } from './manufacturers.helpers';

function getRequestErrorMessage(error, fallback) {
   return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      fallback
   );
}

function getRequestsLabel(count) {
   return `${count} ${pluralizeRu(count, ['заявка', 'заявки', 'заявок'])}`;
}

function getFirstRejectionMessage(results, fallback) {
   const rejected = results.find((result) => result.status === 'rejected');

   return rejected ? getRequestErrorMessage(rejected.reason, fallback) : fallback;
}

export function useManufacturerRequests({ onSuccess } = {}) {
   const [requests, setRequests] = useState([]);
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState('');
   const [isSubmitting, setIsSubmitting] = useState(false);

   const loadRequests = useCallback(async () => {
      try {
         setIsLoading(true);
         setError('');

         const response = await fetchManufacturerRequests();

         setRequests(normalizeManufacturerRequestsResponse(response));
      } catch (requestError) {
         setError(
            getRequestErrorMessage(requestError, 'Не удалось загрузить заявки'),
         );
      } finally {
         setIsLoading(false);
      }
   }, []);

   useEffect(() => {
      loadRequests();
   }, [loadRequests]);

   const runRequests = useCallback(
      async (manufacturerIds, request, { successVerb, errorFallback }) => {
         if (manufacturerIds.length === 0) {
            return false;
         }

         try {
            setIsSubmitting(true);

            const results = await Promise.allSettled(
               manufacturerIds.map(request),
            );

            const fulfilled = results.filter(
               (result) => result.status === 'fulfilled',
            ).length;

            if (fulfilled === 0) {
               notifyError(getFirstRejectionMessage(results, errorFallback));

               return false;
            }

            if (fulfilled < manufacturerIds.length) {
               notifyError(
                  `${successVerb}: ${fulfilled} из ${manufacturerIds.length}. ${getFirstRejectionMessage(
                     results,
                     errorFallback,
                  )}`,
               );
            } else {
               notifySuccess(`${successVerb}: ${getRequestsLabel(fulfilled)}`);
            }

            await loadRequests();
            await onSuccess?.();

            return true;
         } finally {
            setIsSubmitting(false);
         }
      },
      [loadRequests, onSuccess],
   );

   const approveRequests = useCallback(
      (manufacturerIds) =>
         runRequests(manufacturerIds, approveManufacturerRequest, {
            successVerb: 'Заявки одобрены',
            errorFallback: 'Не удалось одобрить заявки',
         }),
      [runRequests],
   );

   const rejectRequests = useCallback(
      (manufacturerIds) =>
         runRequests(manufacturerIds, rejectManufacturerRequest, {
            successVerb: 'Заявки отклонены',
            errorFallback: 'Не удалось отклонить заявки',
         }),
      [runRequests],
   );

   const withdrawRequests = useCallback(
      (manufacturerIds) =>
         runRequests(manufacturerIds, detachManufacturer, {
            successVerb: 'Заявки отозваны',
            errorFallback: 'Не удалось отозвать заявки',
         }),
      [runRequests],
   );

   const sendRequest = useCallback(
      async (manufacturerId) => {
         if (!manufacturerId) {
            return false;
         }

         try {
            setIsSubmitting(true);

            await attachManufacturer(manufacturerId);

            notifySuccess('Заявка отправлена');

            await loadRequests();
            await onSuccess?.();

            return true;
         } catch (requestError) {
            notifyError(
               getRequestErrorMessage(
                  requestError,
                  'Не удалось отправить заявку',
               ),
            );

            return false;
         } finally {
            setIsSubmitting(false);
         }
      },
      [loadRequests, onSuccess],
   );

   return {
      requests,
      isLoading,
      error,
      isSubmitting,
      approveRequests,
      rejectRequests,
      withdrawRequests,
      sendRequest,
      reloadRequests: loadRequests,
   };
}

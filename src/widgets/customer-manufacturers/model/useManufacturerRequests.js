import { useCallback, useEffect, useState } from 'react';
import i18n from '../../../shared/i18n';

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
   return i18n.t('manufacturers.requestCount', { count });
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
            getRequestErrorMessage(requestError, i18n.t("manufacturers.requests.loadFailed")),
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
                  i18n.t('manufacturers.bulk.result', {
                     action: successVerb,
                     done: fulfilled,
                     total: manufacturerIds.length,
                     reason: getFirstRejectionMessage(results, errorFallback),
                  }),
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
            successVerb: i18n.t("manufacturers.requests.approved"),
            errorFallback: i18n.t("manufacturers.requests.approveFailed"),
         }),
      [runRequests],
   );

   const rejectRequests = useCallback(
      (manufacturerIds) =>
         runRequests(manufacturerIds, rejectManufacturerRequest, {
            successVerb: i18n.t("manufacturers.requests.rejected"),
            errorFallback: i18n.t("manufacturers.requests.rejectFailed"),
         }),
      [runRequests],
   );

   const withdrawRequests = useCallback(
      (manufacturerIds) =>
         runRequests(manufacturerIds, detachManufacturer, {
            successVerb: i18n.t("manufacturers.requests.withdrawn"),
            errorFallback: i18n.t("manufacturers.requests.withdrawFailed"),
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

            notifySuccess(i18n.t("enums.manufacturerStatus.requestSent"));

            await loadRequests();
            await onSuccess?.();

            return true;
         } catch (requestError) {
            notifyError(
               getRequestErrorMessage(
                  requestError,
                  i18n.t("manufacturers.requests.sendFailed"),
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

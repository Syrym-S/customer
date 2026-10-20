import { useCallback, useState } from 'react';

import {
   attachManufacturer,
   attachManufacturerToLead,
   detachManufacturer,
   detachManufacturerFromLead,
} from '../api/manufacturers.repository';
import {
   notifyError,
   notifySuccess,
} from '../../../shared/model/notifications.store';
import { pluralizeRu } from '../../../shared/helpers/plural.helpers';

function getRequestErrorMessage(error, fallback) {
   return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      fallback
   );
}

function getLeadsLabel(count) {
   return `${count} ${pluralizeRu(count, ['перевозка', 'перевозки', 'перевозок'])}`;
}

function getFirstRejectionMessage(results, fallback) {
   const rejected = results.find((result) => result.status === 'rejected');

   return rejected ? getRequestErrorMessage(rejected.reason, fallback) : fallback;
}

export function useManufacturerLinkActions({ onSuccess } = {}) {
   const [isSubmitting, setIsSubmitting] = useState(false);

   const runLeadRequests = useCallback(
      async (leadIds, request, { successVerb, errorFallback }) => {
         if (leadIds.length === 0) {
            return false;
         }

         try {
            setIsSubmitting(true);

            const results = await Promise.allSettled(leadIds.map(request));

            const fulfilled = results.filter(
               (result) => result.status === 'fulfilled',
            ).length;

            if (fulfilled === 0) {
               notifyError(getFirstRejectionMessage(results, errorFallback));

               return false;
            }

            if (fulfilled < leadIds.length) {
               notifyError(
                  `${successVerb}: ${fulfilled} из ${leadIds.length}. ${getFirstRejectionMessage(
                     results,
                     errorFallback,
                  )}`,
               );
            } else {
               notifySuccess(`${successVerb}: ${getLeadsLabel(fulfilled)}`);
            }

            await onSuccess?.();

            return true;
         } finally {
            setIsSubmitting(false);
         }
      },
      [onSuccess],
   );

   const attachLeads = useCallback(
      (manufacturerId, leadIds) => {
         if (!manufacturerId) {
            return Promise.resolve(false);
         }

         return runLeadRequests(
            leadIds,
            (leadId) => attachManufacturerToLead(leadId, manufacturerId),
            {
               successVerb: 'Производитель привязан',
               errorFallback: 'Не удалось привязать производителя',
            },
         );
      },
      [runLeadRequests],
   );

   const detachLeads = useCallback(
      (leadIds) =>
         runLeadRequests(leadIds, (leadId) => detachManufacturerFromLead(leadId), {
            successVerb: 'Производитель откреплен',
            errorFallback: 'Не удалось открепить производителя',
         }),
      [runLeadRequests],
   );

   const addManufacturer = useCallback(
      async (manufacturerId) => {
         try {
            setIsSubmitting(true);

            await attachManufacturer(manufacturerId);

            notifySuccess('Производитель добавлен');

            await onSuccess?.();

            return true;
         } catch (error) {
            notifyError(
               getRequestErrorMessage(error, 'Не удалось добавить производителя'),
            );

            return false;
         } finally {
            setIsSubmitting(false);
         }
      },
      [onSuccess],
   );

   const removeManufacturer = useCallback(
      async (manufacturerId) => {
         try {
            setIsSubmitting(true);

            await detachManufacturer(manufacturerId);

            notifySuccess('Производитель удален из списка');

            await onSuccess?.();

            return true;
         } catch (error) {
            notifyError(
               getRequestErrorMessage(error, 'Не удалось удалить производителя'),
            );

            return false;
         } finally {
            setIsSubmitting(false);
         }
      },
      [onSuccess],
   );

   return {
      attachLeads,
      detachLeads,
      addManufacturer,
      removeManufacturer,
      isSubmitting,
   };
}

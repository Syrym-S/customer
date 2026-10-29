import { useCallback, useState } from 'react';
import i18n from '../../../shared/i18n';

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

function getRequestErrorMessage(error, fallback) {
   return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      fallback
   );
}

function getLeadsLabel(count) {
   return i18n.t('common.shipmentCount', { count });
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
                  i18n.t('manufacturers.bulk.result', {
                     action: successVerb,
                     done: fulfilled,
                     total: leadIds.length,
                     reason: getFirstRejectionMessage(results, errorFallback),
                  }),
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
               successVerb: i18n.t("manufacturers.link.success"),
               errorFallback: i18n.t("manufacturers.link.failed"),
            },
         );
      },
      [runLeadRequests],
   );

   const detachLeads = useCallback(
      (leadIds) =>
         runLeadRequests(leadIds, (leadId) => detachManufacturerFromLead(leadId), {
            successVerb: i18n.t("manufacturers.unlink.success"),
            errorFallback: i18n.t("manufacturers.unlink.failed"),
         }),
      [runLeadRequests],
   );

   const addManufacturer = useCallback(
      async (manufacturerId) => {
         try {
            setIsSubmitting(true);

            await attachManufacturer(manufacturerId);

            notifySuccess(i18n.t("manufacturers.add.success"));

            await onSuccess?.();

            return true;
         } catch (error) {
            notifyError(
               getRequestErrorMessage(error, i18n.t("manufacturers.add.failed")),
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

            notifySuccess(i18n.t("manufacturers.remove.success"));

            await onSuccess?.();

            return true;
         } catch (error) {
            notifyError(
               getRequestErrorMessage(error, i18n.t("manufacturers.remove.failed")),
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

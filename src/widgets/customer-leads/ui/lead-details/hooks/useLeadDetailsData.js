import { useCallback, useEffect, useRef, useState } from 'react';

import { fetchCustomerLeadById } from '../../../api/leads.repository';
import { mapLeadDetailsResponseFromApi } from '../../../model/lead.adapter';
import {
   notificationDomainEventNames,
   subscribeToNotificationDomainEvent,
} from '../../../../../shared/model/notification-domain-events';

export function useLeadDetailsData(openLead) {
   const [leadDetails, setLeadDetails] = useState(null);
   const [isLeadDetailsLoading, setIsLeadDetailsLoading] = useState(false);
   const [leadDetailsError, setLeadDetailsError] = useState(null);

   const requestIdRef = useRef(0);

   function resetLeadDetails() {
      setLeadDetails(null);
      setLeadDetailsError(null);
      setIsLeadDetailsLoading(false);
   }

   const loadLeadDetails = useCallback(
      async (leadId, { withLoader = true } = {}) => {
         const requestId = ++requestIdRef.current;

         try {
            if (withLoader) {
               setIsLeadDetailsLoading(true);
            }

            setLeadDetailsError(null);

            const response = await fetchCustomerLeadById(leadId);
            const mappedLead = mapLeadDetailsResponseFromApi(response);

            if (requestId === requestIdRef.current) {
               setLeadDetails(mappedLead);
            }
         } catch (error) {
            if (requestId === requestIdRef.current) {
               setLeadDetailsError(error.message || 'Не удалось загрузить лид');
            }
         } finally {
            if (withLoader && requestId === requestIdRef.current) {
               setIsLeadDetailsLoading(false);
            }
         }
      },
      [],
   );

   useEffect(() => {
      if (!openLead?.id) {
         setLeadDetails(null);
         return;
      }

      loadLeadDetails(openLead.id, { withLoader: true });
   }, [openLead?.id, loadLeadDetails]);

   useEffect(() => {
      if (!openLead?.id) {
         return undefined;
      }

      // Lead status changes (e.g. emergency_situation) publish under "shipping", not "lead".
      function handleLeadRelatedEvent() {
         loadLeadDetails(openLead.id, { withLoader: false });
      }

      const unsubscribeLeads = subscribeToNotificationDomainEvent(
         notificationDomainEventNames.leadsChanged,
         handleLeadRelatedEvent,
      );
      const unsubscribeShipping = subscribeToNotificationDomainEvent(
         notificationDomainEventNames.shippingChanged,
         handleLeadRelatedEvent,
      );

      return () => {
         unsubscribeLeads();
         unsubscribeShipping();
      };
   }, [openLead?.id, loadLeadDetails]);

   return {
      leadDetails,
      setLeadDetails,
      isLeadDetailsLoading,
      leadDetailsError,
      resetLeadDetails,
   };
}

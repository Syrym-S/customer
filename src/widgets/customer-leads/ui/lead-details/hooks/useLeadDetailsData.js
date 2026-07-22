import { useEffect, useState } from 'react';

import { fetchCustomerLeadById } from '../../../api/leads.repository';
import { mapLeadDetailsResponseFromApi } from '../../../model/lead.adapter';

export function useLeadDetailsData(openLead) {
   const [leadDetails, setLeadDetails] = useState(null);
   const [isLeadDetailsLoading, setIsLeadDetailsLoading] = useState(false);
   const [leadDetailsError, setLeadDetailsError] = useState(null);

   function resetLeadDetails() {
      setLeadDetails(null);
      setLeadDetailsError(null);
      setIsLeadDetailsLoading(false);
   }

   useEffect(() => {
      if (!openLead?.id) {
         setLeadDetails(null);
         return;
      }

      let isCancelled = false;

      async function loadLeadDetails() {
         try {
            setIsLeadDetailsLoading(true);
            setLeadDetailsError(null);

            const response = await fetchCustomerLeadById(openLead.id);
            const mappedLead = mapLeadDetailsResponseFromApi(response);

            if (!isCancelled) {
               setLeadDetails(mappedLead);
            }
         } catch (error) {
            if (!isCancelled) {
               setLeadDetailsError(error.message || 'Не удалось загрузить лид');
            }
         } finally {
            if (!isCancelled) {
               setIsLeadDetailsLoading(false);
            }
         }
      }

      loadLeadDetails();

      return () => {
         isCancelled = true;
      };
   }, [openLead?.id]);

   return {
      leadDetails,
      setLeadDetails,
      isLeadDetailsLoading,
      leadDetailsError,
      resetLeadDetails,
   };
}

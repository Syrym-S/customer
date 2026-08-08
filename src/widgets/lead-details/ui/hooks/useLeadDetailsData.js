import { useEffect, useState } from 'react';

import { fetchLeadById } from '../../../../entities/lead/api/leads.api';
import { mapLeadDetailsResponseFromApi } from '../../../../entities/lead/model/lead.adapter';

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

            const response = await fetchLeadById(openLead.id);
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

import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { mapLeadFromApi } from '../../model/lead.adapter';
import { useLeadsContext } from '../../model/useLeadsContext';

function getLeadIdFromPathname(pathname) {
   const match = String(pathname).match(/\/customer\/leads\/([^/?#]+)/);

   return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function LeadDetailsRouteSync() {
   const { leadId: paramsLeadId } = useParams();
   const { setOpenLead } = useLeadsContext();
   const routeLeadId =
      paramsLeadId || getLeadIdFromPathname(window.location.pathname);

   useEffect(() => {
      if (!routeLeadId) {
         return;
      }

      setOpenLead((prevOpenLead) => {
         if (String(prevOpenLead?.id) === String(routeLeadId)) {
            return prevOpenLead;
         }

         return {
            ...mapLeadFromApi({ id: routeLeadId }),
            isRoutePlaceholder: true,
         };
      });
   }, [routeLeadId, setOpenLead]);

   return null;
}

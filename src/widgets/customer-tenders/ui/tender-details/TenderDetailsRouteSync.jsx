import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useTendersContext } from '../../model/useTendersContext';

function getTenderIdFromPathname(pathname) {
   const match = String(pathname).match(/\/customer\/tenders\/([^/?#]+)/);

   return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function TenderDetailsRouteSync() {
   const { tenderId: paramsTenderId } = useParams();
   const { openTenderDetails } = useTendersContext();

   const lastSyncedTenderIdRef = useRef(null);

   const routeTenderId =
      paramsTenderId || getTenderIdFromPathname(window.location.pathname);

   useEffect(() => {
      if (!routeTenderId) {
         lastSyncedTenderIdRef.current = null;
         return;
      }

      if (String(lastSyncedTenderIdRef.current) === String(routeTenderId)) {
         return;
      }

      lastSyncedTenderIdRef.current = routeTenderId;

      openTenderDetails({
         id: routeTenderId,
         isRoutePlaceholder: true,
      });
   }, [routeTenderId, openTenderDetails]);

   return null;
}
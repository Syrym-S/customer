import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { fetchComplaintById } from '../api/complaints.api';
import { useComplaintsContext } from '../model/useComplaintsContext';

// Mirrors customer-leads/ui/lead-details/LeadDetailsRouteSync.jsx: turns a
// direct navigation to /customer/complaints/:complaintId into the modal
// opening with that complaint's data, the same way the leads list page
// resolves a :leadId route param into its details modal.
export function ComplaintDetailsRouteSync() {
   const { complaintId } = useParams();
   const { openComplaint, setOpenComplaint } = useComplaintsContext();

   useEffect(() => {
      if (!complaintId) {
         return undefined;
      }

      if (String(openComplaint?.id) === String(complaintId)) {
         return undefined;
      }

      let isCancelled = false;

      fetchComplaintById(complaintId).then((response) => {
         if (!isCancelled && response?.data) {
            setOpenComplaint(response.data);
         }
      });

      return () => {
         isCancelled = true;
      };
   }, [complaintId, openComplaint?.id, setOpenComplaint]);

   return null;
}

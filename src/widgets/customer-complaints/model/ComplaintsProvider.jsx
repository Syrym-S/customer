import PropTypes from 'prop-types';
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchComplaints } from '../api/complaints.api';
import { ComplaintsContext } from './ComplaintsContext';


export function ComplaintsProvider({ children }) {
   const { t } = useTranslation();

   const [complaints, setComplaints] = useState([]);
   const [openComplaint, setOpenComplaint] = useState(null);

   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState(null);

   const loadComplaints = useCallback(async ({ withLoader = true } = {}) => {
      try {
         if (withLoader) {
            setIsLoading(true);
         }

         setError(null);

         const response = await fetchComplaints();

         setComplaints(Array.isArray(response.results) ? response.results : []);
      } catch (requestError) {
         setError(requestError.message || t("complaints.loadFailed"));
      } finally {
         if (withLoader) {
            setIsLoading(false);
         }
      }
   }, [t]);

   useEffect(() => {
      loadComplaints({ withLoader: true });
   }, [loadComplaints]);

   const value = useMemo(
      () => ({
         complaints,
         openComplaint,
         setOpenComplaint,

         isLoading,
         error,

         reloadComplaints: loadComplaints,
      }),
      [complaints, openComplaint, isLoading, error, loadComplaints],
   );

   return (
      <ComplaintsContext.Provider value={value}>
         {children}
      </ComplaintsContext.Provider>
   );
}

ComplaintsProvider.propTypes = {
   children: PropTypes.node.isRequired,
};

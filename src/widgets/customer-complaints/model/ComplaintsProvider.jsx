import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchComplaints } from '../api/complaints.repository';
import { ComplaintsContext } from './ComplaintsContext';

const DEFAULT_PER_PAGE = 10;

export function ComplaintsProvider({ children }) {
   const [complaints, setComplaints] = useState([]);
   const [openComplaint, setOpenComplaint] = useState(null);

   const [page, setPage] = useState(1);
   const [perPage] = useState(DEFAULT_PER_PAGE);
   const [count, setCount] = useState(0);

   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState(null);

   const loadComplaints = useCallback(
      async ({ withLoader = true } = {}) => {
         try {
            if (withLoader) {
               setIsLoading(true);
            }

            setError(null);

            const response = await fetchComplaints({ page, perPage });

            setComplaints(Array.isArray(response.results) ? response.results : []);
            setCount(response.count ?? 0);
         } catch (requestError) {
            setError(requestError.message || 'Не удалось загрузить жалобы');
         } finally {
            if (withLoader) {
               setIsLoading(false);
            }
         }
      },
      [page, perPage],
   );

   useEffect(() => {
      loadComplaints({ withLoader: true });
   }, [loadComplaints]);

   const value = useMemo(
      () => ({
         complaints,
         openComplaint,
         setOpenComplaint,

         page,
         setPage,
         perPage,
         count,

         isLoading,
         error,

         reloadComplaints: loadComplaints,
      }),
      [complaints, openComplaint, page, perPage, count, isLoading, error, loadComplaints],
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

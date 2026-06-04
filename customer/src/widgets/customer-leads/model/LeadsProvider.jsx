import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';

import { fetchCustomerLeads } from '../api/leads.repository';
import { mapLeadsResponseFromApi } from './lead.adapter';
import { LeadsContext } from './LeadsContext';

const DEFAULT_PER_PAGE = 4;

export function LeadsProvider({ children }) {
   const [leads, setLeads] = useState([]);
   const [openLead, setOpenLead] = useState(null);

   const [page, setPage] = useState(1);
   const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
   const [count, setCount] = useState(0);

   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState(null);

   useEffect(() => {
      async function loadLeads() {
         try {
            setIsLoading(true);
            setError(null);

            const response = await fetchCustomerLeads({ page, perPage });
            const mappedResponse = mapLeadsResponseFromApi(response);

            setLeads(mappedResponse.leads);
            setCount(mappedResponse.count);
            setPerPage(mappedResponse.perPage);
         } catch (requestError) {
            setError(requestError.message);
         } finally {
            setIsLoading(false);
         }
      }

      loadLeads();
   }, [page, perPage]);

   const value = useMemo(
      () => ({
         leads,
         openLead,
         setOpenLead,

         page,
         setPage,
         perPage,
         setPerPage,
         count,

         isLoading,
         error,
      }),
      [leads, openLead, page, perPage, count, isLoading, error],
   );

   return (
      <LeadsContext.Provider value={value}>{children}</LeadsContext.Provider>
   );
}

LeadsProvider.propTypes = {
   children: PropTypes.node.isRequired,
};

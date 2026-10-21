import { useCallback, useEffect, useState } from 'react';

import { fetchCustomerLeads } from '../../customer-leads/api/leads.repository';
import { mapLeadsResponseFromApi } from '../../customer-leads/model/lead.adapter';
import { withLeadManufacturers } from '../api/manufacturers.repository';
import { LEADS_POOL_LIMIT } from './manufacturers.helpers';

export function useLeadsPool(manufacturerId = '') {
   const [leads, setLeads] = useState([]);
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState('');

   const loadLeads = useCallback(async () => {
      try {
         setIsLoading(true);
         setError('');

         const response = await fetchCustomerLeads({
            page: 1,
            perPage: LEADS_POOL_LIMIT,
            manufacturerId,
         });

         const mappedResponse = mapLeadsResponseFromApi(response);

         setLeads(withLeadManufacturers(mappedResponse.leads));
      } catch (requestError) {
         setError(
            requestError.response?.data?.message ||
               requestError.message ||
               'Не удалось загрузить перевозки',
         );
      } finally {
         setIsLoading(false);
      }
   }, [manufacturerId]);

   useEffect(() => {
      loadLeads();
   }, [loadLeads]);

   return { leads, isLoading, error, reloadLeads: loadLeads };
}

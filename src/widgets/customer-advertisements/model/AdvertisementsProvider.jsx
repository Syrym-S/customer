import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
   closeAdvertisement,
   deleteAdvertisement,
   fetchAdvertisement,
   fetchAdvertisements,
} from '../api/advertisements.repository';
import { AdvertisementsContext } from './AdvertisementsContext';

const DEFAULT_PER_PAGE = 10;

export function AdvertisementsProvider({ children }) {
   const { t } = useTranslation();

   const [advertisements, setAdvertisements] = useState([]);
   const [page, setPage] = useState(1);
   const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
   const [count, setCount] = useState(0);

   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState(null);

   const loadAdvertisements = useCallback(
      async ({ withLoader = true } = {}) => {
         try {
            if (withLoader) {
               setIsLoading(true);
            }

            setError(null);

            const response = await fetchAdvertisements({ page, perPage });

            setAdvertisements(
               Array.isArray(response.results) ? response.results : [],
            );
            setCount(response.count ?? 0);
            setPerPage(response.perPage ?? perPage);
         } catch (requestError) {
            setError(requestError.message || t('advertisements.loadFailed'));
         } finally {
            if (withLoader) {
               setIsLoading(false);
            }
         }
      },
      [page, perPage, t],
   );

   const closeAdvertisementById = useCallback(
      async (advertisementId) => {
         const closed = await closeAdvertisement(advertisementId);

         let refreshed = null;

         try {
            refreshed = await fetchAdvertisement(advertisementId);
         } catch {
            refreshed = null;
         }

         await loadAdvertisements({ withLoader: false });

         return refreshed?.closedAt ? refreshed : closed || refreshed;
      },
      [loadAdvertisements],
   );

   const deleteAdvertisementById = useCallback(
      async (advertisementId) => {
         await deleteAdvertisement(advertisementId);

         await loadAdvertisements({ withLoader: false });
      },
      [loadAdvertisements],
   );

   useEffect(() => {
      loadAdvertisements({ withLoader: true });
   }, [loadAdvertisements]);

   const pagesCount = Math.max(1, Math.ceil(count / perPage));

   const value = useMemo(
      () => ({
         advertisements,
         page,
         perPage,
         count,
         pagesCount,
         setPage,
         isLoading,
         error,
         reloadAdvertisements: loadAdvertisements,
         closeAdvertisement: closeAdvertisementById,
         deleteAdvertisement: deleteAdvertisementById,
      }),
      [
         advertisements,
         page,
         perPage,
         count,
         pagesCount,
         isLoading,
         error,
         loadAdvertisements,
         closeAdvertisementById,
         deleteAdvertisementById,
      ],
   );

   return (
      <AdvertisementsContext.Provider value={value}>
         {children}
      </AdvertisementsContext.Provider>
   );
}

AdvertisementsProvider.propTypes = {
   children: PropTypes.node.isRequired,
};

import { useContext } from 'react';

import { AdvertisementsContext } from './AdvertisementsContext';

export function useAdvertisementsContext() {
   const context = useContext(AdvertisementsContext);

   if (!context) {
      throw new Error(
         'useAdvertisementsContext must be used inside AdvertisementsProvider',
      );
   }

   return context;
}

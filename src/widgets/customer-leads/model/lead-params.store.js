import { useEffect } from 'react';
import { create } from 'zustand';

import { fetchLeadParams } from '../api/lead-params.repository';

const emptyOptions = {
   loadingType: [],
   packagingType: [],
   compositionType: [],
   transportType: [],
};

export const useLeadParamsStore = create((set, get) => ({
   options: emptyOptions,
   status: 'idle',

   ensureLeadParamsLoaded() {
      const { status } = get();

      if (status === 'loading' || status === 'loaded') {
         return;
      }

      set({ status: 'loading' });

      fetchLeadParams()
         .then((options) => {
            set({ options, status: 'loaded' });
         })
         .catch((error) => {
            console.error('Не удалось загрузить параметры заявки:', error);
            set({ options: emptyOptions, status: 'error' });
         });
   },
}));

// Fetches the four option lists once per session (cached in the store) and
// keeps the consuming component subscribed to them.
export function useLeadParamsOptions() {
   const options = useLeadParamsStore((state) => state.options);
   const ensureLeadParamsLoaded = useLeadParamsStore(
      (state) => state.ensureLeadParamsLoaded,
   );

   useEffect(() => {
      ensureLeadParamsLoaded();
   }, [ensureLeadParamsLoaded]);

   return options;
}

import { useContext } from 'react';

import { ComplaintsContext } from './ComplaintsContext';

export function useComplaintsContext() {
   const context = useContext(ComplaintsContext);

   if (!context) {
      throw new Error(
         'useComplaintsContext must be used inside ComplaintsProvider',
      );
   }

   return context;
}

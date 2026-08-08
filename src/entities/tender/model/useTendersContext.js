import { useContext } from 'react';

import { TendersContext } from './TendersContext';

export function useTendersContext() {
   const context = useContext(TendersContext);

   if (!context) {
      throw new Error('useTendersContext must be used within TendersProvider');
   }

   return context;
}

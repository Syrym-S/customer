import { useContext } from 'react';

import { ForwardersContext } from './ForwardersContext';

export function useForwardersContext() {
   const context = useContext(ForwardersContext);

   if (!context) {
      throw new Error(
         'useForwardersContext must be used inside ForwardersProvider',
      );
   }

   return context;
}

import { useContext } from 'react';

import { LeadsContext } from './LeadsContext';

export function useOptionalLeadsContext() {
   return useContext(LeadsContext);
}

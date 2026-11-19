import { useMemo } from 'react';

import { useFeatureFlagsStore } from '../../../shared/model/feature-flags.store';
import { createCustomerStatsConfig } from './stats.config';

export function useCustomerStatsConfig() {
   const isFactoringEnabled = useFeatureFlagsStore((state) => state.factoring);
   const isTenderEnabled = useFeatureFlagsStore((state) => state.tender);

   return useMemo(
      () => createCustomerStatsConfig({ isFactoringEnabled, isTenderEnabled }),
      [isFactoringEnabled, isTenderEnabled],
   );
}

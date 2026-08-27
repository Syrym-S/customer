import { create } from 'zustand';

import { checkContractStatus } from '../api/contract.api';

export const useContractStore = create((set) => ({
   hasValidContract: null,

   async checkContract() {
      const { hasValidContract } = await checkContractStatus();

      set({ hasValidContract });
   },
}));

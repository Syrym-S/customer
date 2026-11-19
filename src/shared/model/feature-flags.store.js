import { create } from 'zustand';

import { fetchFeatureFlags } from '../api/contract.api';
import { isNative } from '../config/platform';

function normalizeFlags(features) {
   const source = features && typeof features === 'object' ? features : {};

   return {
      factoring: source.factoring ?? true,
      manufacturer: source.manufacturer ?? true,
      tender: source.tender ?? true,
      advertisement_customer: source.advertisement_customer ?? true,
      login_ecp: source.login_ecp === true,
   };
}

const appDataFeatures = window?.APP_DATA?.features;

export const useFeatureFlagsStore = create((set, get) => ({
   ...normalizeFlags(appDataFeatures),
   isLoading: false,
   isLoaded: !isNative,

   async load() {
      if (get().isLoading || get().isLoaded) {
         return;
      }

      set({ isLoading: true });

      try {
         const response = await fetchFeatureFlags();
         const features = response?.data ?? response;

         set({ ...normalizeFlags(features), isLoaded: true });
      } catch {
         set({ isLoaded: true });
      } finally {
         set({ isLoading: false });
      }
   },

   reset() {
      set({ ...normalizeFlags(appDataFeatures), isLoaded: !isNative });
   },
}));

export function getFeatureFlags() {
   const { factoring, manufacturer, tender, advertisement_customer, login_ecp } =
      useFeatureFlagsStore.getState();

   return {
      factoring,
      manufacturer,
      tender,
      advertisement_customer,
      login_ecp,
   };
}

export function loadFeatureFlags() {
   return useFeatureFlagsStore.getState().load();
}

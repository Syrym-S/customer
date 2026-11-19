import { create } from 'zustand';

import { fetchSupportContactsApi } from '../api/support.api';

function readAppDataContacts() {
   const support = window?.APP_DATA?.support || {};

   return {
      email: String(support.email || '').trim(),
      phone: String(support.phone || '').trim(),
   };
}

export const useSupportContactsStore = create((set, get) => ({
   ...readAppDataContacts(),
   isLoading: false,
   isLoaded: false,

   async load() {
      const { email, phone, isLoading, isLoaded } = get();

      if (isLoading || isLoaded || (email && phone)) {
         return;
      }

      set({ isLoading: true });

      try {
         const contacts = await fetchSupportContactsApi();

         set({
            email: contacts.email || email,
            phone: contacts.phone || phone,
            isLoaded: true,
         });
      } catch {
         set({ isLoaded: true });
      } finally {
         set({ isLoading: false });
      }
   },
}));

export function getSupportContactsSnapshot() {
   const { email, phone } = useSupportContactsStore.getState();

   return { email, phone };
}

export function loadSupportContacts() {
   return useSupportContactsStore.getState().load();
}

import { create } from 'zustand';

export const useNotificationNavigationStore = create((set) => ({
   pendingLink: '',

   setPendingLink: (link) => set({ pendingLink: link || '' }),

   clearPendingLink: () => set({ pendingLink: '' }),
}));

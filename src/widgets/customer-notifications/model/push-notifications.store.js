import { create } from 'zustand';

import { deletePushTokenApi, savePushTokenApi } from '../api/push.api';
import {
   fetchCustomerProfile,
   updateCustomerProfile,
} from '../../../features/profile-edit/profile.api';
import {
   deleteWebPushToken,
   getWebPushPermission,
   isWebPushSupported,
   refreshWebPushToken,
   requestWebPushToken,
} from '../../../services/firebase';

function readPushEnabled(profile) {
   return Boolean(profile?.pushEnabled ?? profile?.data?.pushEnabled);
}

export const usePushNotificationsStore = create((set, get) => ({
   isSupported: false,
   permission: 'default',
   isEnabled: false,
   token: '',
   isBusy: false,

   // Состояние галочки складывается из трёх независимых источников: поддержка
   // браузером, выданное разрешение и флаг в профиле. Разъехаться они могут
   // легко — например, пользователь включил пуши на другом устройстве.
   async init() {
      const isSupported = await isWebPushSupported();

      set({ isSupported, permission: getWebPushPermission() });

      if (!isSupported) {
         return;
      }

      const profile = await fetchCustomerProfile();
      const isEnabled = readPushEnabled(profile);

      set({ isEnabled });

      if (!isEnabled || get().permission !== 'granted') {
         return;
      }

      // Токен мог смениться сам — повторная отправка просто перезапишет запись.
      const token = await refreshWebPushToken();

      if (token) {
         await savePushTokenApi(token);
         set({ token });
      }
   },

   // Возвращает false, если пользователь отказал в разрешении: флаг в профиле
   // в этом случае не ставим.
   async enable() {
      set({ isBusy: true });

      try {
         const token = await requestWebPushToken();

         set({ permission: getWebPushPermission() });

         if (!token) {
            return false;
         }

         await savePushTokenApi(token);
         await updateCustomerProfile({ pushEnabled: true });

         set({ isEnabled: true, token });

         return true;
      } finally {
         set({ isBusy: false });
      }
   },

   async disable() {
      set({ isBusy: true });

      try {
         // Токены на всех устройствах удаляет сам бэк по этому флагу.
         await updateCustomerProfile({ pushEnabled: false });
         await deleteWebPushToken();

         set({ isEnabled: false, token: '' });
      } finally {
         set({ isBusy: false });
      }
   },

   // Перед логаутом: иначе на общем компьютере пуши первого пользователя
   // продолжат приходить, когда за машиной сидит второй.
   async unbindCurrentDevice() {
      const { token } = get();

      if (!token) {
         return;
      }

      await deletePushTokenApi(token);
      await deleteWebPushToken();

      set({ token: '' });
   },
}));

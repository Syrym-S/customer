import { create } from 'zustand';

import i18n, { getCurrentLanguage } from '../../../shared/i18n';

import { deletePushTokenApi, savePushTokenApi } from '../api/push.api';
import {
   fetchCustomerProfile,
   updateCustomerProfile,
} from '../../../features/profile-edit/profile.api';
import { isNative } from '../../../shared/config/platform';
import {
   deleteWebPushToken,
   getPushPermission,
   isPushPermissionRequestable,
   isWebPushSupported,
   refreshWebPushToken,
   requestPushPermission,
   requestWebPushToken,
} from '../../../services/firebase';

let initPromise = null;
let registeredLanguage = null;
let removeLanguageListener = null;

function detachLanguageListener() {
   if (!removeLanguageListener) {
      return;
   }

   removeLanguageListener();
   removeLanguageListener = null;
}

function attachLanguageListener() {
   if (removeLanguageListener) {
      return;
   }

   async function handleLanguageChanged(language) {
      const { isEnabled, token } = usePushNotificationsStore.getState();

      if (!isEnabled || !token || language === registeredLanguage) {
         return;
      }

      try {
         await savePushTokenApi(token);
         registeredLanguage = language;
      } catch (error) {
         console.error('Push token re-registration failed', error);
      }
   }

   i18n.on('languageChanged', handleLanguageChanged);

   removeLanguageListener = () => {
      i18n.off('languageChanged', handleLanguageChanged);
   };
}

// Флаг может не прийти вовсе: в мобильном приложении это значит «по умолчанию
// включено», иначе первый запуск после установки остался бы без пушей.
function readPushEnabled(profile) {
   const value = profile?.pushEnabled ?? profile?.data?.pushEnabled;

   if (value === undefined || value === null || value === '') {
      return isNative;
   }

   return value === true || value === 1 || value === '1' || value === 'true';
}

async function registerToken() {
   const token = await refreshWebPushToken();

   if (!token) {
      return;
   }

   console.info('Push FCM token:', token);

   await savePushTokenApi(token);

   registeredLanguage = getCurrentLanguage();
   attachLanguageListener();

   usePushNotificationsStore.setState({ token });
}

async function resolveInitPush() {
   const isSupported = await isWebPushSupported();

   usePushNotificationsStore.setState({
      isSupported,
      permission: await getPushPermission(),
   });

   if (!isSupported) {
      return;
   }

   const profile = await fetchCustomerProfile();
   const isEnabled = readPushEnabled(profile);

   usePushNotificationsStore.setState({ isEnabled });

   if (!isEnabled) {
      return;
   }

   let { permission } = usePushNotificationsStore.getState();

   // В вебе системный запрос показывается только по клику в настройках, на
   // нативе это обычное runtime-разрешение и его просят на старте.
   if (permission !== 'granted' && isPushPermissionRequestable()) {
      permission = await requestPushPermission();

      usePushNotificationsStore.setState({ permission });
   }

   if (permission !== 'granted') {
      return;
   }

   await registerToken();
}

export const usePushNotificationsStore = create((set, get) => ({
   isSupported: false,
   permission: 'default',
   isEnabled: false,
   token: '',
   isBusy: false,

   // Состояние галочки складывается из трёх независимых источников: поддержка
   // платформой, выданное разрешение и флаг в профиле. Разъехаться они могут
   // легко — например, пользователь включил пуши на другом устройстве.
   init() {
      if (!initPromise) {
         initPromise = resolveInitPush().catch((error) => {
            console.error('Push failed to initialize', error);

            initPromise = null;
         });
      }

      return initPromise;
   },

   // Возвращает false, если пользователь отказал в разрешении: флаг в профиле
   // в этом случае не ставим.
   async enable() {
      set({ isBusy: true });

      try {
         const token = await requestWebPushToken();

         set({ permission: await getPushPermission() });

         if (!token) {
            return false;
         }

         await savePushTokenApi(token);
         await updateCustomerProfile({ pushEnabled: true });

         registeredLanguage = getCurrentLanguage();
         attachLanguageListener();

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

         detachLanguageListener();
         registeredLanguage = null;
         initPromise = null;

         set({ isEnabled: false, token: '' });
      } finally {
         set({ isBusy: false });
      }
   },

   // Перед логаутом: иначе на общем устройстве пуши первого пользователя
   // продолжат приходить, когда за ним сидит второй.
   async unbindCurrentDevice() {
      const token = get().token || (await refreshWebPushToken());

      detachLanguageListener();
      registeredLanguage = null;
      initPromise = null;

      if (!token) {
         return;
      }

      await deletePushTokenApi(token);
      await deleteWebPushToken();

      set({ token: '' });
   },
}));

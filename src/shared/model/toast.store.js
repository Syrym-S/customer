import { create } from 'zustand';

function createNotificationId() {
   return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function logNotification(notification) {
   const logPayload = {
      title: notification.title,
      message: notification.message,
      meta: notification.meta,
   };

   if (notification.type === 'error') {
      console.error('[notification:error]', logPayload);
      return;
   }

   if (notification.type === 'warning') {
      console.warn('[notification:warning]', logPayload);
      return;
   }

   console.log(`[notification:${notification.type}]`, logPayload);
}

export const useToastStore = create((set) => ({
   notifications: [],

   addToast: ({
      type = 'success',
      title = '',
      message,
      meta = null,
      autoCloseMs = 5000,
   }) => {
      const notification = {
         id: createNotificationId(),
         type,
         title,
         message,
         meta,
         autoCloseMs,
         createdAt: Date.now(),
      };

      logNotification(notification);

      set((state) => ({
         notifications: [notification, ...state.notifications],
      }));

      return notification.id;
   },

   removeToast: (id) => {
      set((state) => ({
         notifications: state.notifications.filter(
            (notification) => notification.id !== id,
         ),
      }));
   },

   clearToasts: () => {
      set({ notifications: [] });
   },
}));

export function notifyError(message, meta) {
   return useToastStore.getState().addToast({
      type: 'error',
      message,
      meta,
   });
}

export function notifyWarning(message, meta) {
   return useToastStore.getState().addToast({
      type: 'warning',
      message,
      meta,
   });
}

export function notifySuccess(message, meta) {
   return useToastStore.getState().addToast({
      type: 'success',
      message,
      meta,
   });
}

export function notifyRealtimeNotification(notification) {
   if (!notification?.message && !notification?.theme) {
      return null;
   }

   return useToastStore.getState().addToast({
      type: 'info',
      title: notification.theme || 'Новое уведомление',
      message: notification.message || 'У вас новое уведомление',
      autoCloseMs: 8000,
      meta: {
         source: 'realtime-notification',
         notification,
      },
   });
}

export function notifyEmailVerificationRequired() {
   const { notifications, addToast } = useToastStore.getState();

   const alreadyExists = notifications.some(
      (notification) => notification.meta?.source === 'email-verification',
   );

   if (alreadyExists) {
      return null;
   }

   return addToast({
      type: 'warning',
      title: 'Email не подтверждён',
      message:
         'Подтвердите электронную почту. Нажмите на уведомление, чтобы отправить письмо повторно.',
      autoCloseMs: 0,
      meta: {
         source: 'email-verification',
      },
   });
}

export function removeEmailVerificationNotification() {
   const { notifications, removeToast } =
      useToastStore.getState();

   const notification = notifications.find(
      (item) => item.meta?.source === 'email-verification',
   );

   if (notification) {
      removeToast(notification.id);
   }
}

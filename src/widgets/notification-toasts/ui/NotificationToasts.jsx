import { useEffect } from 'react';

import { Alert, Box, IconButton, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import {
   useToastStore,
} from '../../../shared/model/toast.store';
import { appEventNames } from '../../../shared/model/app-events';

const notificationTitleMap = {
   error: 'Ошибка',
   warning: 'Предупреждение',
   success: 'Успешно',
   info: 'Уведомление',
};

export function NotificationToasts() {
   const { notifications, removeNotification } = useToastStore();

   useEffect(() => {
      const timeoutIds = notifications
         .filter((notification) => notification.autoCloseMs > 0)
         .map((notification) =>
            window.setTimeout(() => {
               removeNotification(notification.id);
            }, notification.autoCloseMs),
         );

      return () => {
         timeoutIds.forEach((timeoutId) => {
            window.clearTimeout(timeoutId);
         });
      };
   }, [notifications, removeNotification]);

   function handleNotificationClick(notification) {
      const realtimeNotification = notification.meta?.notification;

      if (notification.meta?.source === 'email-verification') {
         window.dispatchEvent(
            new CustomEvent(appEventNames.openEmailVerificationModal),
         );

         return;
      }

      if (notification.meta?.source !== 'realtime-notification') {
         return;
      }

      window.dispatchEvent(
         new CustomEvent(appEventNames.openRealtimeNotificationToast, {
            detail: {
               notification: realtimeNotification,
            },
         }),
      );

      removeNotification(notification.id);
   }

   if (notifications.length === 0) {
      return null;
   }

   return (
      <Box
         sx={{
            position: 'fixed',
            right: {
               xs: 12,
               sm: 24,
            },
            bottom: {
               xs: 12,
               sm: 24,
            },
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column-reverse',
            gap: 1.25,
            width: {
               xs: 'calc(100vw - 24px)',
               sm: 360,
            },
            maxHeight: 'calc(100vh - 48px)',
            overflowY: 'auto',
            pointerEvents: 'none',
         }}
      >
         {notifications.map((notification) => {
            const isClickable =
               notification.meta?.source === 'realtime-notification' ||
               notification.meta?.source === 'email-verification';
            const isEmailVerificationNotification =
               notification.meta?.source === 'email-verification';

            return (
               <Alert
                  key={notification.id}
                  severity={notification.type}
                  variant='filled'
                  onClick={() => handleNotificationClick(notification)}
                  action={
                     !isEmailVerificationNotification ? (
                        <IconButton
                           size='small'
                           color='inherit'
                           onClick={(event) => {
                              event.stopPropagation();
                              removeNotification(notification.id);
                           }}
                        >
                           <CloseRoundedIcon fontSize='small' />
                        </IconButton>
                     ) : null
                  }
                  sx={{
                     width: '100%',
                     borderRadius: 3,
                     boxShadow: '0 12px 32px rgba(0, 0, 0, 0.22)',
                     alignItems: 'flex-start',
                     pointerEvents: 'auto',
                     cursor: isClickable ? 'pointer' : 'default',
                  }}
               >
                  <Typography
                     sx={{
                        fontSize: 13,
                        fontWeight: 700,
                        lineHeight: 1.3,
                        mb: 0.25,
                     }}
                  >
                     {notification.title ||
                        notificationTitleMap[notification.type] ||
                        'Сообщение'}
                  </Typography>

                  <Typography
                     sx={{
                        fontSize: 13,
                        lineHeight: 1.4,
                     }}
                  >
                     {notification.message}
                  </Typography>
               </Alert>
            );
         })}
      </Box>
   );
}

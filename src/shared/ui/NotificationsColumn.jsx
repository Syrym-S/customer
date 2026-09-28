import { useEffect, useRef, useState } from 'react';

import PropTypes from 'prop-types';

import { Alert, Box, IconButton, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import {
   REALTIME_NOTIFICATION_TOAST_OPEN_EVENT,
   useNotificationsStore,
} from '../model/notifications.store';
import { EMAIL_VERIFICATION_MODAL_OPEN_EVENT } from '../../widgets/customer-verification/model/email-verification.helpers';

const notificationTitleMap = {
   error: 'Ошибка',
   warning: 'Предупреждение',
   success: 'Успешно',
   info: 'Уведомление',
};

const TRANSITION_DURATION_MS = 300;
const REDUCED_MOTION_DURATION_MS = 150;

function usePrefersReducedMotion() {
   const [prefersReducedMotion, setPrefersReducedMotion] = useState(
      () =>
         typeof window !== 'undefined' &&
         window.matchMedia('(prefers-reduced-motion: reduce)').matches,
   );

   useEffect(() => {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const handleChange = () =>
         setPrefersReducedMotion(mediaQuery.matches);

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
   }, []);

   return prefersReducedMotion;
}

function NotificationToast({
   notification,
   isVisible,
   duration,
   prefersReducedMotion,
   onExited,
   onClick,
   onCloseClick,
   isClickable,
   isEmailVerificationNotification,
}) {
   const [hasEntered, setHasEntered] = useState(false);
   const onExitedRef = useRef(onExited);
   onExitedRef.current = onExited;

   useEffect(() => {
      const enterFrameId = window.requestAnimationFrame(() => {
         const paintFrameId = window.requestAnimationFrame(() => {
            setHasEntered(true);
         });

         return () => window.cancelAnimationFrame(paintFrameId);
      });

      return () => window.cancelAnimationFrame(enterFrameId);
   }, []);

   useEffect(() => {
      if (isVisible) {
         return undefined;
      }

      const timeoutId = window.setTimeout(() => {
         onExitedRef.current();
      }, duration);

      return () => window.clearTimeout(timeoutId);
   }, [isVisible, duration]);

   const shown = isVisible && hasEntered;

   return (
      <Alert
         severity={notification.type}
         variant='filled'
         onClick={onClick}
         action={
            !isEmailVerificationNotification ? (
               <IconButton size='small' color='inherit' onClick={onCloseClick}>
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
            transition: prefersReducedMotion
               ? `opacity ${duration}ms ease`
               : `transform ${duration}ms ease, opacity ${duration}ms ease`,
            transform: prefersReducedMotion
               ? 'none'
               : `translateX(${shown ? '0' : '120%'})`,
            opacity: shown ? 1 : 0,
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
}

NotificationToast.propTypes = {
   notification: PropTypes.shape({
      id: PropTypes.string,
      type: PropTypes.string,
      title: PropTypes.string,
      message: PropTypes.string,
   }).isRequired,
   isVisible: PropTypes.bool.isRequired,
   duration: PropTypes.number.isRequired,
   prefersReducedMotion: PropTypes.bool.isRequired,
   onExited: PropTypes.func.isRequired,
   onClick: PropTypes.func.isRequired,
   onCloseClick: PropTypes.func.isRequired,
   isClickable: PropTypes.bool.isRequired,
   isEmailVerificationNotification: PropTypes.bool.isRequired,
};

export function NotificationsColumn() {
   const { notifications, removeNotification } = useNotificationsStore();
   const [items, setItems] = useState(notifications);
   const prefersReducedMotion = usePrefersReducedMotion();

   useEffect(() => {
      setItems((currentItems) => {
         const currentIds = new Set(
            currentItems.map((notification) => notification.id),
         );
         const newNotifications = notifications.filter(
            (notification) => !currentIds.has(notification.id),
         );

         if (newNotifications.length === 0) {
            return currentItems;
         }

         return [...newNotifications, ...currentItems];
      });
   }, [notifications]);

   function handleExited(id) {
      setItems((currentItems) =>
         currentItems.filter((notification) => notification.id !== id),
      );
   }

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
            new CustomEvent(EMAIL_VERIFICATION_MODAL_OPEN_EVENT),
         );

         return;
      }

      if (notification.meta?.source !== 'realtime-notification') {
         return;
      }

      window.dispatchEvent(
         new CustomEvent(REALTIME_NOTIFICATION_TOAST_OPEN_EVENT, {
            detail: {
               notification: realtimeNotification,
            },
         }),
      );

      removeNotification(notification.id);
   }

   if (items.length === 0) {
      return null;
   }

   return (
      <Box
         sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            overflowX: 'hidden',
            overflowY: 'visible',
            pointerEvents: 'none',
         }}
      >
         <Box
            sx={{
               position: 'absolute',
               right: {
                  xs: 12,
                  sm: 24,
               },
               bottom: {
                  xs: 12,
                  sm: 24,
               },
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
            {items.map((notification) => {
               const isVisible = notifications.some(
                  (activeNotification) =>
                     activeNotification.id === notification.id,
               );
               const isClickable =
                  notification.meta?.source === 'realtime-notification' ||
                  notification.meta?.source === 'email-verification';
               const isEmailVerificationNotification =
                  notification.meta?.source === 'email-verification';

               const duration = prefersReducedMotion
                  ? REDUCED_MOTION_DURATION_MS
                  : TRANSITION_DURATION_MS;

               return (
                  <NotificationToast
                     key={notification.id}
                     notification={notification}
                     isVisible={isVisible}
                     duration={duration}
                     prefersReducedMotion={prefersReducedMotion}
                     onExited={() => handleExited(notification.id)}
                     onClick={() => handleNotificationClick(notification)}
                     onCloseClick={(event) => {
                        event.stopPropagation();
                        removeNotification(notification.id);
                     }}
                     isClickable={isClickable}
                     isEmailVerificationNotification={
                        isEmailVerificationNotification
                     }
                  />
               );
            })}
         </Box>
      </Box>
   );
}

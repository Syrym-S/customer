import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from "react-i18next";

import PropTypes from 'prop-types';

import { keyframes } from '@emotion/react';

import { Alert, Box, IconButton, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import {
   REALTIME_NOTIFICATION_TOAST_OPEN_EVENT,
   useNotificationsStore,
} from '../model/notifications.store';
import { EMAIL_VERIFICATION_MODAL_OPEN_EVENT } from '../../widgets/customer-verification/model/email-verification.helpers';

const NOTIFICATION_TITLE_KEYS = {
   error: 'common.severity.error',
   warning: 'common.severity.warning',
   success: 'common.severity.success',
   info: 'common.severity.notice',
};

const ENTER_DURATION_MS = 260;
const EXIT_DURATION_MS = 200;
const REDUCED_MOTION_DURATION_MS = 120;

const ENTER_EASING = 'cubic-bezier(0.2, 0, 0, 1)';
const EXIT_EASING = 'cubic-bezier(0.4, 0, 1, 1)';

const SLIDE_OFFSET_PX = 24;
const STACK_GAP_PX = 10;

const slideIn = keyframes`
   from {
      opacity: 0;
      transform: translate3d(${SLIDE_OFFSET_PX}px, 0, 0);
   }
   to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
   }
`;

const slideOut = keyframes`
   from {
      opacity: 1;
      transform: translate3d(0, 0, 0);
   }
   to {
      opacity: 0;
      transform: translate3d(${SLIDE_OFFSET_PX}px, 0, 0);
   }
`;

const fadeIn = keyframes`
   from {
      opacity: 0;
   }
   to {
      opacity: 1;
   }
`;

const fadeOut = keyframes`
   from {
      opacity: 1;
   }
   to {
      opacity: 0;
   }
`;

const collapse = keyframes`
   from {
      margin-top: var(--toast-gap);
   }
   to {
      margin-top: var(--toast-collapse);
   }
`;

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
   isPaused,
   prefersReducedMotion,
   onExited,
   onAutoClose,
   onClick,
   onCloseClick,
   isClickable,
   isEmailVerificationNotification,
}) {
   const { t } = useTranslation();

   const wrapperRef = useRef(null);
   const [exitHeight, setExitHeight] = useState(null);

   const onExitedRef = useRef(onExited);
   onExitedRef.current = onExited;

   const onAutoCloseRef = useRef(onAutoClose);
   onAutoCloseRef.current = onAutoClose;

   const remainingMsRef = useRef(notification.autoCloseMs);

   const enterDuration = prefersReducedMotion
      ? REDUCED_MOTION_DURATION_MS
      : ENTER_DURATION_MS;
   const exitDuration = prefersReducedMotion
      ? REDUCED_MOTION_DURATION_MS
      : EXIT_DURATION_MS;

   useLayoutEffect(() => {
      if (isVisible) {
         return;
      }

      setExitHeight(wrapperRef.current?.offsetHeight ?? 0);
   }, [isVisible]);

   useEffect(() => {
      if (isVisible) {
         return undefined;
      }

      const timeoutId = window.setTimeout(() => {
         onExitedRef.current();
      }, exitDuration);

      return () => window.clearTimeout(timeoutId);
   }, [isVisible, exitDuration]);

   useEffect(() => {
      if (!isVisible || isPaused || remainingMsRef.current <= 0) {
         return undefined;
      }

      const startedAt = Date.now();
      const timeoutId = window.setTimeout(() => {
         onAutoCloseRef.current();
      }, remainingMsRef.current);

      return () => {
         window.clearTimeout(timeoutId);
         remainingMsRef.current -= Date.now() - startedAt;
      };
   }, [isVisible, isPaused]);

   const isExiting = !isVisible && exitHeight !== null;

   const enterAnimation = prefersReducedMotion ? fadeIn : slideIn;
   const exitAnimation = prefersReducedMotion ? fadeOut : slideOut;

   return (
      <Box
         ref={wrapperRef}
         sx={{
            '--toast-gap': `${STACK_GAP_PX}px`,
            '--toast-collapse': `${-(exitHeight ?? 0)}px`,
            marginTop: 'var(--toast-gap)',
            animation: isExiting
               ? `${collapse} ${exitDuration}ms ${EXIT_EASING} both`
               : 'none',
         }}
      >
         <Alert
            severity={notification.type}
            variant='filled'
            onClick={isClickable ? onClick : undefined}
            action={
               !isEmailVerificationNotification ? (
                  <IconButton
                     size='small'
                     color='inherit'
                     aria-label={t('common.actions.close')}
                     onClick={onCloseClick}
                  >
                     <CloseRoundedIcon fontSize='small' />
                  </IconButton>
               ) : null
            }
            sx={(theme) => ({
               width: '100%',
               borderRadius: `${theme.radius.lg}px`,
               boxShadow: theme.customShadows.hover,
               alignItems: 'flex-start',
               pointerEvents: 'auto',
               cursor: isClickable ? 'pointer' : 'default',
               willChange: 'transform, opacity',
               animation: isExiting
                  ? `${exitAnimation} ${exitDuration}ms ${EXIT_EASING} both`
                  : `${enterAnimation} ${enterDuration}ms ${ENTER_EASING} both`,
            })}
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
                  t(
                     NOTIFICATION_TITLE_KEYS[notification.type] ||
                        'common.severity.info',
                  )}
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
      </Box>
   );
}

NotificationToast.propTypes = {
   notification: PropTypes.shape({
      id: PropTypes.string,
      type: PropTypes.string,
      title: PropTypes.string,
      message: PropTypes.string,
      autoCloseMs: PropTypes.number,
   }).isRequired,
   isVisible: PropTypes.bool.isRequired,
   isPaused: PropTypes.bool.isRequired,
   prefersReducedMotion: PropTypes.bool.isRequired,
   onExited: PropTypes.func.isRequired,
   onAutoClose: PropTypes.func.isRequired,
   onClick: PropTypes.func.isRequired,
   onCloseClick: PropTypes.func.isRequired,
   isClickable: PropTypes.bool.isRequired,
   isEmailVerificationNotification: PropTypes.bool.isRequired,
};

export function NotificationsColumn() {
   const { notifications, removeNotification } = useNotificationsStore();
   const [items, setItems] = useState(notifications);
   const [isPaused, setIsPaused] = useState(false);
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
            pointerEvents: 'none',
         }}
      >
         <Box
            role='status'
            aria-live='polite'
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
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
               width: {
                  xs: 'calc(100% - 24px)',
                  sm: 360,
               },
               maxHeight: {
                  xs: 'calc(100dvh - 24px)',
                  sm: 'calc(100dvh - 48px)',
               },
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

               return (
                  <NotificationToast
                     key={notification.id}
                     notification={notification}
                     isVisible={isVisible}
                     isPaused={isPaused}
                     prefersReducedMotion={prefersReducedMotion}
                     onExited={() => handleExited(notification.id)}
                     onAutoClose={() => removeNotification(notification.id)}
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

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { navigateToNotificationLink } from '../model/notification-navigation';
import { useNotificationNavigationStore } from '../model/notification-navigation.store';

export function NotificationNavigationWatcher() {
   const navigate = useNavigate();

   const pendingLink = useNotificationNavigationStore(
      (state) => state.pendingLink,
   );
   const clearPendingLink = useNotificationNavigationStore(
      (state) => state.clearPendingLink,
   );

   useEffect(() => {
      if (!pendingLink) {
         return;
      }

      clearPendingLink();
      navigateToNotificationLink({ link: pendingLink, navigate });
   }, [pendingLink, clearPendingLink, navigate]);

   return null;
}

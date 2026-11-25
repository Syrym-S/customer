import { openExternalLink } from '../../../shared/lib/external-link';
import {
   NOTIFICATION_LINK_EXTERNAL,
   NOTIFICATION_LINK_IN_APP,
   resolveNotificationLinkTarget,
} from '../lib/notification-link';
import { useNotificationNavigationStore } from './notification-navigation.store';

export function navigateToNotificationLink({ link, navigate }) {
   const target = resolveNotificationLinkTarget(link);

   if (target.kind === NOTIFICATION_LINK_IN_APP) {
      navigate(target.path);

      return true;
   }

   if (target.kind === NOTIFICATION_LINK_EXTERNAL) {
      openExternalLink(target.url);

      return true;
   }

   return false;
}

export function requestNotificationLinkNavigation(link) {
   if (!link) {
      return;
   }

   useNotificationNavigationStore.getState().setPendingLink(link);
}

import { getSessionUserId } from '../model/session.store';

export function getCurrentUserId() {
   const sessionUserId = getSessionUserId();

   if (sessionUserId != null) {
      return sessionUserId;
   }

   const appData = window?.APP_DATA || {};

   return appData.user_id ?? appData.userId ?? null;
}

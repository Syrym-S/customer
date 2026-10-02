export function getCurrentUserId() {
   const appData = window?.APP_DATA || {};

   return appData.user_id ?? appData.userId ?? null;
}

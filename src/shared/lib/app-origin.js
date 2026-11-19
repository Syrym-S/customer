import { getSessionHomeUrl, getSessionRestUrl } from '../model/session.store';

function toOrigin(value) {
   const raw = String(value || '').trim();

   if (!raw) {
      return '';
   }

   try {
      return new URL(raw).origin;
   } catch {
      return '';
   }
}

export function getAppOrigin() {
   return (
      toOrigin(getSessionHomeUrl()) ||
      toOrigin(getSessionRestUrl()) ||
      toOrigin(window?.APP_DATA?.rest_url) ||
      window?.location?.origin ||
      ''
   );
}

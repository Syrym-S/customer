import { getSessionHomeUrl, getSessionRestUrl } from '../model/session.store';
import { isNative } from '../config/platform';

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

export function getKnownAppOrigins() {
   const origins = [
      toOrigin(getSessionHomeUrl()),
      toOrigin(getSessionRestUrl()),
      toOrigin(window?.APP_DATA?.rest_url),
   ];

   if (!isNative) {
      origins.push(window?.location?.origin || '');
   }

   return origins.filter((origin, index) => origin && origins.indexOf(origin) === index);
}

export function getAppOrigin() {
   return getKnownAppOrigins()[0] || window?.location?.origin || '';
}

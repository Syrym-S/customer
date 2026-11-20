import { AppLauncher } from '@capacitor/app-launcher';
import { isNative } from '../config/platform';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizePhone(value) {
   if (typeof value !== 'string' && typeof value !== 'number') {
      return '';
   }

   const raw = String(value).trim();

   if (!raw) {
      return '';
   }

   const withoutScheme = raw.replace(/^tel:/i, '').trim();
   const digits = withoutScheme.replace(/\D/g, '');

   if (!digits) {
      return '';
   }

   return withoutScheme.startsWith('+') ? `+${digits}` : digits;
}

export function normalizeEmail(value) {
   if (typeof value !== 'string') {
      return '';
   }

   const email = value
      .trim()
      .replace(/^mailto:/i, '')
      .trim()
      .toLowerCase();

   if (!email || !EMAIL_RE.test(email)) {
      return '';
   }

   return email;
}

export function getPhoneHref(value) {
   const phone = normalizePhone(value);

   return phone ? `tel:${phone}` : '';
}

export function getEmailHref(value, { subject = '', body = '' } = {}) {
   const email = normalizeEmail(value);

   if (!email) {
      return '';
   }

   const params = [];

   if (subject) {
      params.push(`subject=${encodeURIComponent(subject)}`);
   }

   if (body) {
      params.push(`body=${encodeURIComponent(body)}`);
   }

   return params.length ? `mailto:${email}?${params.join('&')}` : `mailto:${email}`;
}

function openInBrowser(url) {
   try {
      window.location.href = url;

      return true;
   } catch {
      return false;
   }
}

export async function openContactUrl(url) {
   if (!url) {
      return false;
   }

   if (!isNative) {
      return openInBrowser(url);
   }

   try {
      const { completed } = await AppLauncher.openUrl({ url });

      if (completed) {
         return true;
      }

      return false;
   } catch {
      return openInBrowser(url);
   }
}

export function handleContactLinkClick(event, href) {
   event.stopPropagation();

   if (!isNative || !href) {
      return;
   }

   event.preventDefault();

   openContactUrl(href);
}

export function openPhone(value) {
   return openContactUrl(getPhoneHref(value));
}

export function openEmail(value, options) {
   return openContactUrl(getEmailHref(value, options));
}

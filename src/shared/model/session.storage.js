import { SecureStorage } from '@aparajita/capacitor-secure-storage';

import { isNative } from '../config/platform';

const STORAGE_KEY = 'customer_session';

let cachedSession = null;

function parseSession(value) {
   if (!value) {
      return null;
   }

   try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;

      return parsed && typeof parsed === 'object' ? parsed : null;
   } catch {
      return null;
   }
}

function readLocalSession() {
   try {
      return parseSession(window.localStorage.getItem(STORAGE_KEY));
   } catch {
      return null;
   }
}

function writeLocalSession(session) {
   try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
   } catch {
      return;
   }
}

function removeLocalSession() {
   try {
      window.localStorage.removeItem(STORAGE_KEY);
   } catch {
      return;
   }
}

async function readSecureSession() {
   try {
      return parseSession(await SecureStorage.get(STORAGE_KEY, false));
   } catch {
      return null;
   }
}

async function writeSecureSession(session) {
   try {
      await SecureStorage.set(STORAGE_KEY, JSON.stringify(session));

      return true;
   } catch {
      return false;
   }
}

async function removeSecureSession() {
   try {
      await SecureStorage.remove(STORAGE_KEY);
   } catch {
      return;
   }
}

export function readStoredSessionSync() {
   if (isNative) {
      return null;
   }

   cachedSession = readLocalSession();

   return cachedSession;
}

export async function loadStoredSession() {
   if (!isNative) {
      return readStoredSessionSync();
   }

   let session = await readSecureSession();

   if (!session) {
      const legacySession = readLocalSession();

      if (legacySession && (await writeSecureSession(legacySession))) {
         removeLocalSession();
         session = legacySession;
      }
   }

   cachedSession = session;

   return session;
}

export function writeStoredSession(session) {
   cachedSession = session;

   if (!isNative) {
      writeLocalSession(session);

      return;
   }

   void writeSecureSession(session);
}

export function removeStoredSession() {
   cachedSession = null;

   if (!isNative) {
      removeLocalSession();

      return;
   }

   void removeSecureSession();
   removeLocalSession();
}

export function getCachedSession() {
   return cachedSession;
}

const STORAGE_KEY = 'customer_session';

export function readStoredSession() {
   try {
      const raw = window.localStorage.getItem(STORAGE_KEY);

      if (!raw) {
         return null;
      }

      const parsed = JSON.parse(raw);

      return parsed && typeof parsed === 'object' ? parsed : null;
   } catch {
      return null;
   }
}

export function writeStoredSession(session) {
   try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
   } catch {
      return;
   }
}

export function removeStoredSession() {
   try {
      window.localStorage.removeItem(STORAGE_KEY);
   } catch {
      return;
   }
}

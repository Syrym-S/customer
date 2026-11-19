import { create } from 'zustand';

import {
   readStoredSession,
   removeStoredSession,
   writeStoredSession,
} from './session.storage';

const EMPTY_SESSION = {
   token: '',
   userId: null,
   restUrl: '',
   homeUrl: '',
   mode: '',
   notifws: null,
   geows: null,
};

function normalizeRestUrl(value) {
   const restUrl = String(value || '').trim();

   if (!restUrl) {
      return '';
   }

   return restUrl.endsWith('/') ? restUrl : `${restUrl}/`;
}

export function normalizeSessionPayload(payload) {
   const data = payload?.data && typeof payload.data === 'object' ? payload.data : payload;

   if (!data || typeof data !== 'object') {
      return null;
   }

   const token = String(data.token || data.access_token || '').trim();

   if (!token) {
      return null;
   }

   return {
      token,
      userId: data.user_id ?? data.userId ?? data.notifws?.user ?? null,
      restUrl: normalizeRestUrl(data.rest_url || data.restUrl),
      homeUrl: String(data.home_url || data.homeUrl || '').trim(),
      mode: String(data.mode || '').trim(),
      notifws: data.notifws || data.notifWs || null,
      geows: data.geows || data.geoWs || null,
   };
}

export const useSessionStore = create((set, get) => ({
   ...EMPTY_SESSION,
   ...(readStoredSession() || {}),
   isSessionExpired: false,

   setSession(payload) {
      const session = normalizeSessionPayload(payload);

      if (!session) {
         return false;
      }

      writeStoredSession(session);
      set({ ...session, isSessionExpired: false });

      return true;
   },

   clearSession() {
      removeStoredSession();
      set({ ...EMPTY_SESSION });
   },

   expireSession() {
      if (!get().token) {
         return;
      }

      removeStoredSession();
      set({ ...EMPTY_SESSION, isSessionExpired: true });
   },

   acknowledgeSessionExpiry() {
      set({ isSessionExpired: false });
   },
}));

export function getSessionToken() {
   return useSessionStore.getState().token;
}

export function getSessionRestUrl() {
   return useSessionStore.getState().restUrl;
}

export function getSessionHomeUrl() {
   return useSessionStore.getState().homeUrl;
}

export function getSessionUserId() {
   return useSessionStore.getState().userId;
}

export function getSessionNotifWsConfig() {
   return useSessionStore.getState().notifws;
}

export function getSessionGeoWsConfig() {
   return useSessionStore.getState().geows;
}

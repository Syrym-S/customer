import { create } from 'zustand';

import { checkContractStatus, initiateContractSigning, fetchFeatureFlags } from '../api/contract.api';

// Set in sessionStorage right before redirecting the tab to Aitu's sign_url,
// and checked on next app mount (see useContractGate.js) so a real redirect
// back triggers an immediate recheck regardless of what (if anything) Aitu
// appends to the return URL.
export const CONTRACT_SIGN_REDIRECT_MARKER_KEY = 'contract_sign_redirect_pending';

// Same fail-closed fallback used both for the window.APP_DATA seed value
// below and for refreshFeatureFlags()'s response handling — a compliance
// check must stay active when its source is missing, not silently disable.
const DEFAULT_IS_CONTRACT_GATE_ENABLED = true;

export const useContractStore = create((set, get) => ({
   hasValidContract: null,

   // Admin-panel switch (per-service enable/disable of Aitu Passport-based
   // verification steps) for this service's contract-signing step. Seeded
   // synchronously from window.APP_DATA — injected server-side before the
   // bundle runs, so it's already available at store creation — then kept
   // fresh by refreshFeatureFlags() polling GET /customer/v1/features (see
   // useContractGate.js) so an admin toggling it takes effect without a
   // page reload. Store state rather than a module const specifically so
   // the three consuming sites (App.jsx, ContractGateModal.jsx,
   // api-client.js) pick up updates instead of reading a stale value.
   isContractGateEnabled:
      window?.APP_DATA?.features?.aitu_contract_signing ?? DEFAULT_IS_CONTRACT_GATE_ENABLED,

   // sign_date/expires_at from the last status check, if the backend included
   // them (see contract.api.js) — null until a check resolves or if the
   // backend didn't send them. Not currently used to gate anything, only to
   // display alongside the "подписан" state.
   contractSignDate: null,
   contractExpiresAt: null,

   // True only while the user is on the profile page specifically because
   // they followed the "Перейти в профиль" link from the missing-fields
   // signing error (set by suspendGateForProfile — see ContractGateModal.jsx).
   // Nothing else sets this, so simply navigating to /customer/profile some
   // other way while hasValidContract is false does NOT suspend the gate.
   contractGateSuspendedForProfile: false,

   async checkContract() {
      const { hasValidContract, signDate, expiresAt } = await checkContractStatus();

      set({
         hasValidContract,
         contractSignDate: signDate,
         contractExpiresAt: expiresAt,
      });
   },

   // Polled alongside checkContract() (see useContractGate.js) so an admin
   // toggling the flag takes effect for already-open tabs without a reload.
   // Same fail-closed fallback as the window.APP_DATA seed: a missing field
   // in the response keeps the gate active rather than disabling it.
   async refreshFeatureFlags() {
      const features = await fetchFeatureFlags();

      set({
         isContractGateEnabled:
            features?.aitu_contract_signing ?? DEFAULT_IS_CONTRACT_GATE_ENABLED,
      });
   },

   // Used for the 409 "already signed" response from initiateContractSigning —
   // that response body already tells us signed: true, so there's no need to
   // round-trip through another status check to unblock the app.
   markContractValid() {
      set({ hasValidContract: true });
   },

   suspendGateForProfile() {
      set({ contractGateSuspendedForProfile: true });
   },

   // Called when the user leaves the profile page. No-ops if the gate wasn't
   // suspended (e.g. they reached /customer/profile some other way), so it's
   // safe to call unconditionally on every profile-page unmount.
   resumeGateAfterProfile() {
      if (!get().contractGateSuspendedForProfile) {
         return;
      }

      set({ contractGateSuspendedForProfile: false });
      get().checkContract();
   },
}));

// Shared entry point into the signing flow, used by both ContractGateModal
// and the profile page's "Договор с сервисом" card so the redirect-marker
// bookkeeping and the 409/already-signed handling only live in one place.
// Resolves { type: 'redirecting' } after kicking off the tab redirect, or
// { type: 'already-signed' } if the backend says it's already signed
// (updates the store itself in that case). Any other error is rethrown for
// the caller to classify/display.
export async function attemptContractSigning() {
   try {
      const data = await initiateContractSigning();

      sessionStorage.setItem(CONTRACT_SIGN_REDIRECT_MARKER_KEY, '1');
      window.location.href = data.sign_url;

      return { type: 'redirecting' };
   } catch (error) {
      if (error.response?.status === 409) {
         useContractStore.getState().markContractValid();
         return { type: 'already-signed' };
      }

      throw error;
   }
}

import { useEffect } from 'react';

import { useContractStore, CONTRACT_SIGN_REDIRECT_MARKER_KEY } from './contract.store';

const CONTRACT_POLL_INTERVAL_MS = 15 * 60 * 1000;

// Re-exported for existing callers (e.g. ContractGateModal.jsx) — the marker
// key itself now lives in contract.store.js, next to attemptContractSigning
// which is the only other place that sets it.
export { CONTRACT_SIGN_REDIRECT_MARKER_KEY };

// Runs the contract check on mount and every 15 minutes after. Returns the
// current hasValidContract value (null until the first check resolves) so
// the caller can hold off rendering data-fetching children until the first
// verdict is known — only the very first check needs to gate anything;
// subsequent polls just update the store non-blockingly.
export function useContractGate() {
   const hasValidContract = useContractStore((state) => state.hasValidContract);
   const checkContract = useContractStore((state) => state.checkContract);
   const refreshFeatureFlags = useContractStore((state) => state.refreshFeatureFlags);

   useEffect(() => {
      // A full-tab redirect back from Aitu's sign_url reloads the page, which
      // remounts the whole app — so the unconditional checkContract() call
      // below already performs the "immediate recheck on return" this marker
      // exists to guarantee. Its only remaining job here is to be cleared so
      // it doesn't linger across future unrelated mounts (e.g. a plain
      // refresh) and get mistaken for another pending return.
      sessionStorage.removeItem(CONTRACT_SIGN_REDIRECT_MARKER_KEY);

      // Shares this interval rather than running its own — the flag doesn't
      // need finer-grained polling than the contract status does.
      function pollContractGateState() {
         checkContract();
         refreshFeatureFlags();
      }

      pollContractGateState();

      const intervalId = setInterval(pollContractGateState, CONTRACT_POLL_INTERVAL_MS);

      return () => clearInterval(intervalId);
   }, [checkContract, refreshFeatureFlags]);

   return hasValidContract;
}

import axios from "axios";
import { useContractStore } from "../model/contract.store";

const DEFAULT_BASE_URL = "https://customer.360logistics.kz/wp-json/";

export const isStaging = window?.APP_DATA?.mode === "staging";

const baseURL = window?.APP_DATA?.rest_url || DEFAULT_BASE_URL;

const nonce = window?.APP_DATA?.nonce || "";

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    // 'Content-Type': 'application/json',
    Accept: "application/json",
    ...(nonce && { "X-WP-Nonce": nonce }),
  },
});

// Thrown by the contract-gate request interceptor below instead of letting a
// request go out. `code` lets callers identify this case specifically if they
// need to (e.g. to avoid surfacing a generic "network error" toast for it);
// existing `error.response?.data?.message || error.message` catch blocks fall
// through to `error.message` unharmed since `response` is undefined here.
export class ContractGateBlockedError extends Error {
  constructor() {
    super("Request blocked: no valid contract on file");
    this.name = "ContractGateBlockedError";
    this.code = "CONTRACT_GATE_BLOCKED";
  }
}

// Blocks all outgoing requests while the contract-gate modal is shown
// (hasValidContract === false), so nothing can reach the API behind the
// blocking modal — not just UI interaction. `hasValidContract === null`
// (not checked yet) and `true` both pass through normally.
//
// The contract-status check itself must always be exempt, otherwise the app
// could never detect the contract becoming valid again. Pass
// `{ skipContractGate: true }` in that request's config to exempt it — see
// the TODO(backend) in contract.api.js, which the real implementation must
// keep in sync with this flag.
//
// contractGateSuspendedForProfile is also checked here (rather than tagging
// every profile view/save call individually with skipContractGate) so the
// "step aside on the profile page" fix from the missing-fields signing error
// applies uniformly to all profile-related requests without touching each
// one — see ContractGateModal.jsx / contract.store.js for how it's set/cleared.
apiClient.interceptors.request.use((config) => {
  if (config.skipContractGate) {
    return config;
  }

  const { hasValidContract, contractGateSuspendedForProfile } =
    useContractStore.getState();

  if (hasValidContract === false && !contractGateSuspendedForProfile) {
    return Promise.reject(new ContractGateBlockedError());
  }

  return config;
});

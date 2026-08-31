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

export class ContractGateBlockedError extends Error {
  constructor() {
    super("Request blocked: no valid contract on file");
    this.name = "ContractGateBlockedError";
    this.code = "CONTRACT_GATE_BLOCKED";
  }
}

apiClient.interceptors.request.use((config) => {
  if (config.skipContractGate) {
    return config;
  }

  const { hasValidContract, contractGateSuspendedForProfile, isContractGateEnabled } =
    useContractStore.getState();

  if (isContractGateEnabled && hasValidContract === false && !contractGateSuspendedForProfile) {
    return Promise.reject(new ContractGateBlockedError());
  }

  return config;
});

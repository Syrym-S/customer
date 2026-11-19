import axios from "axios";
import { useContractStore } from "../model/contract.store";
import i18n from "../i18n";
import { API_BASE_URL } from "../config/api.config";
import { isNative } from "../config/platform";
import { isSessionExpiredResponse } from "./session-expiry.helpers";
import {
  getSessionRestUrl,
  getSessionToken,
  useSessionStore,
} from "../model/session.store";

export const isStaging = window?.APP_DATA?.mode === "staging";

const STAGING_BASENAME = "/staging";

function resolveAppBasename() {
  if (isNative) {
    return "/";
  }

  const pathname = window?.location?.pathname || "/";

  if (
    pathname === STAGING_BASENAME ||
    pathname.startsWith(`${STAGING_BASENAME}/`)
  ) {
    return STAGING_BASENAME;
  }

  return isStaging ? STAGING_BASENAME : "/";
}

export const appBasename = resolveAppBasename();

const baseURL = window?.APP_DATA?.rest_url || API_BASE_URL;

const nonce = window?.APP_DATA?.nonce || "";

export const apiClient = axios.create({
  baseURL,
  withCredentials: !isNative,
  headers: {
    // 'Content-Type': 'application/json',
    Accept: "application/json",
    ...(!isNative && nonce && { "X-WP-Nonce": nonce }),
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
  config.headers.set(
    "Accept-Language",
    i18n.resolvedLanguage || i18n.language || "ru",
  );

  return config;
});

apiClient.interceptors.request.use((config) => {
  if (!isNative) {
    return config;
  }

  const restUrl = getSessionRestUrl();

  if (restUrl) {
    config.baseURL = restUrl;
  }

  const token = getSessionToken();

  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  return config;
});

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

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isNative && isSessionExpiredResponse(error)) {
      useSessionStore.getState().expireSession();
    }

    return Promise.reject(error);
  },
);

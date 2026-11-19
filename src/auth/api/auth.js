import { api } from "./client";
import { isNative } from "../../shared/config/platform";

export const loginRequest = (data, nonce) =>
  isNative
    ? api.post("/auth/v2/auth", data)
    : api.post("/auth/v1/auth", data, {
        headers: {
          "X-WP-Nonce": nonce,
        },
      });

export const registerRequest = (data, nonce) =>
  isNative
    ? api.post("/auth/v2/register", data)
    : api.post("/auth/v1/register", data, {
        headers: {
          "X-WP-Nonce": nonce,
        },
      });

export const forgotPasswordRequest = (data) =>
  api.post(isNative ? "/auth/v2/forgot-password" : "/auth/v1/forgot-password", data);

export const resetPasswordRequest = (data) =>
  api.post(isNative ? "/auth/v2/reset-password" : "/auth/v1/reset-password", data);

export const getClaimInfoApi = (claimCode) =>
  api.get("/auth/v1/claim-info", {
    params: {
      claim: claimCode,
    },
  });

export const getEcpLoginUrlRequest = () => api.get("/auth/v1/ecp");

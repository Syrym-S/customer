import axios from "axios";

import { API_BASE_URL } from "../../shared/config/api.config";
import { isNative } from "../../shared/config/platform";

export const isStaging = window?.APP_DATA?.mode === "staging";

const baseURL = window?.APP_DATA?.rest_url || API_BASE_URL;
const nonce = window?.APP_DATA?.nonce;

export const api = axios.create({
  baseURL: baseURL,
  headers: {
    ...(!isNative && nonce && { "X-WP-Nonce": nonce }),
  },
});

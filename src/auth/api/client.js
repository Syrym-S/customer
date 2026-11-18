import axios from "axios";

export const isStaging = window?.APP_DATA?.mode === "staging";

const DEFAULT_BASE_URL = "https://customer.360logistics.kz/wp-json/";

const baseURL = window?.APP_DATA?.rest_url || DEFAULT_BASE_URL;
const nonce = window?.APP_DATA?.nonce;

export const api = axios.create({
  baseURL: baseURL,
  headers: {
    ...(nonce && { "X-WP-Nonce": nonce }),
  },
});

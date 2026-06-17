import axios from 'axios';

const DEFAULT_BASE_URL = 'https://customer.360logistics.kz/wp-json/';

const baseURL = window?.APP_DATA?.rest_url || DEFAULT_BASE_URL;

const nonce = window?.APP_DATA?.nonce || '';

export const apiClient = axios.create({
   baseURL,
   withCredentials: true,
   headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(nonce && { 'X-WP-Nonce': nonce }),
   },
});

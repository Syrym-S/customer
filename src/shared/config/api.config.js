export const API_MODE = import.meta.env.VITE_API_MODE ?? 'mock';

export const isMockApi = API_MODE === 'mock';
export const isRealApi = API_MODE === 'api';

export const API_BASE_URL =
   import.meta.env.VITE_API_BASE_URL ??
   'https://customer.360logistics.kz/wp-json/';

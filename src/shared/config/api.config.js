export const API_MODE = import.meta.env.VITE_API_MODE ?? 'mock';

export const isMockApi = API_MODE === 'mock';
export const isRealApi = API_MODE === 'api';

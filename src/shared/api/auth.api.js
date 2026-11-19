import { apiClient } from './api-client';
import { isNative } from '../config/platform';
import { useSessionStore } from '../model/session.store';
import { useFeatureFlagsStore } from '../model/feature-flags.store';

export async function logoutApi(pushToken = '') {
   try {
      if (!isNative) {
         const response = await apiClient.post('/auth/v1/logout');

         return response.data;
      }

      const response = await apiClient.post('/auth/v2/logout', {
         ...(pushToken && { push_token: pushToken }),
      });

      return response.data;
   } finally {
      if (isNative) {
         useSessionStore.getState().clearSession();
         useFeatureFlagsStore.getState().reset();
      }
   }
}

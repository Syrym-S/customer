import { apiClient } from '../../../shared/api/apiClient';

export async function generateRouteApi(payload) {
   try {
      const response = await apiClient.post('/routing/v4/generate', payload);

      return response.data;
   } catch (error) {
      console.error('Ошибка генерации маршрута:', {
         message: error.message,
         status: error.response?.status,
         data: error.response?.data,
      });

      return null;
   }
}

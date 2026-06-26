import { apiClient } from '../../../shared/api/api-client';

export async function fetchNotificationWsTokenApi({ signal } = {}) {
    const response = await apiClient.get('/notif/v1/token', {
        signal,
    });

    return response.data;
}

import { apiClient } from "../../../shared/api/api-client";

export async function fetchCustomerNotificationsApi({
    page = 1,
    perPage = 20,
} = {}) {
    const response = await apiClient.get('/customer/v1/notifications', {
        params: {
            page,
            per_page: perPage,
        },
    });

    return response.data;
}

export async function fetchCustomerNotificationByIdApi(notificationId) {
    const response = await apiClient.get(
        `/customer/v1/notifications/${encodeURIComponent(notificationId)}`,
    );

    return response.data;
}

export async function markAllCustomerNotificationsReadApi() {
    const response = await apiClient.post('/customer/v1/notifications/read-all');

    return response.data;
}

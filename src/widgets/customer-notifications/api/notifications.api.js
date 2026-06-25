import { apiClient } from "../../../shared/api/api-client";

export async function fetchCustomerNotificationsApi() {
    const response = await apiClient.get('/customer/v1/notifications');

    return response.data;
}

export async function fetchCustomerNotificationByIdApi(notificationId) {
    const response = await apiClient.get(
        `/customer/v1/notifications/${encodeURIComponent(notificationId)}`,
    );

    return response.data;
}
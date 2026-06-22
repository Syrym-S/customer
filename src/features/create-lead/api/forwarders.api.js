import { apiClient } from '../../../shared/api/api-client';
import { mapForwardersResponseFromApi } from '../model/forwarders.adapter';

export async function searchForwardersApi(query) {
    const normalizedQuery = String(query ?? '').trim();

    if (!normalizedQuery) {
        return [];
    }

    const response = await apiClient.get('/customer/v1/search/forwarders', {
        params: {
            q: normalizedQuery,
        },
    });

    return mapForwardersResponseFromApi(response.data);
}

export async function fetchForwarderById(forwarderId) {
    const { data } = await apiClient.get(
        `/customer/v1/forwarders/${forwarderId}`,
    );
    return data;
}

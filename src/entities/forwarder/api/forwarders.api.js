import { apiClient } from '../../../shared/api/api-client';
import { mapForwardersResponseFromApi } from '../model/forwarder.adapter';

export async function searchForwarders(query) {
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

export async function fetchForwarders({ page = 1, perPage = 10 } = {}) {
    const response = await apiClient.get('/customer/v1/forwarders', {
        params: {
            page,
            per_page: perPage,
        },
    });

    return response.data;
}

export async function createForwarder(payload) {
    const response = await apiClient.post('/customer/v1/forwarders/create', payload);

    return response?.data ?? response;
}
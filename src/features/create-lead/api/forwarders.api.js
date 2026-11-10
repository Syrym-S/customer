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

export async function fetchForwarderById(forwarderId, { page, perPage } = {}) {
    const params = {};

    if (page) {
        params.page = page;
    }

    if (perPage) {
        params.per_page = perPage;
    }

    const { data } = await apiClient.get(
        `/customer/v1/forwarders/${forwarderId}`,
        Object.keys(params).length > 0 ? { params } : undefined,
    );

    return data;
}

export async function fetchForwardersApi({ page = 1, perPage = 10 } = {}) {
    const response = await apiClient.get('/customer/v1/forwarders', {
        params: {
            page,
            per_page: perPage,
        },
    });

    return response.data;
}

export async function createForwarderApi(payload) {
    const response = await apiClient.post('/customer/v1/forwarders/create', payload);

    return response?.data ?? response;
}
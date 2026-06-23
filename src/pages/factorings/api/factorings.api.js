import { apiClient } from '../../../shared/api/api-client';

export async function fetchCustomerFactorings({ page = 1, perPage = 10 } = {}) {
    const response = await apiClient.get('/customer/v1/factorings', {
        params: {
            page,
            per_page: perPage,
        },
    });

    return response.data;
}

export async function fetchCustomerFactoringByIndex(factoringIndex) {
    const response = await apiClient.get(
        `/customer/v1/factoring/${encodeURIComponent(factoringIndex)}`,
    );

    return response.data;
}

export async function createCustomerFactoring(payload) {
    const response = await apiClient.post(
        '/customer/v1/factoring/create',
        payload,
    );

    return response.data;
}

export async function acceptCustomerFactoring(factoringIndex) {
    const response = await apiClient.post(
        `/customer/v1/factoring/${encodeURIComponent(factoringIndex)}/accept`,
    );

    return response.data;
}

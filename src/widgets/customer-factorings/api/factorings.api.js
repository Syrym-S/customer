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

export async function fetchCustomerFactoringById(factoringId) {
    const response = await apiClient.get(
        `/customer/v1/factoring/${encodeURIComponent(factoringId)}`,
    );

    return response.data;
}

export async function acceptCustomerFactoring(factoringId) {
    const response = await apiClient.post(
        `/customer/v1/factoring/${encodeURIComponent(factoringId)}/accept`,
    );

    return response.data;
}

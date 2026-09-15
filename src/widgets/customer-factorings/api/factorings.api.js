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

// Factoring-line document (closed factorings): the factor's already-signed
// line document, plus the customer's own signature status for it.
export async function fetchFactoringLine(factoringId) {
    const response = await apiClient.get(
        `/customer/v1/factoring/line/${encodeURIComponent(factoringId)}`,
    );

    return response.data;
}

export async function acceptFactoringLine(factoringId) {
    const response = await apiClient.post(
        `/customer/v1/factoring/line/${encodeURIComponent(factoringId)}/accept`,
    );

    return response.data;
}

// The general factoring-line contract between forwarder and factor — already
// signed by both, view-only for the customer. Distinct from
// fetchFactoringLine/acceptFactoringLine above (the customer's own document).
export async function fetchFactoringLineDocument(factoringId) {
    const response = await apiClient.get(
        `/customer/v1/factoring/${encodeURIComponent(factoringId)}/line-document`,
    );

    return response.data;
}

export async function cancelCustomerFactoring(factoringId) {
    const response = await apiClient.post(
        `/customer/v1/factoring/${encodeURIComponent(factoringId)}/cancel`,
    );

    return response.data;
}

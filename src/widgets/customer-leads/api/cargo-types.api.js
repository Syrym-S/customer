import { apiClient } from "../../../shared/api/api-client";

function unwrapCargoTypesResponse(response) {
    const data = response?.data ?? response;

    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.data)) {
        return data.data;
    }

    if (Array.isArray(data?.results)) {
        return data.results;
    }

    if (Array.isArray(data?.items)) {
        return data.items;
    }

    return [];
}

export function normalizeCargoType(item) {
    if (!item) {
        return null;
    }

    if (typeof item === 'string') {
        return {
            id: item,
            name: item,
        };
    }

    const name =
        item.name ||
        item.title ||
        item.label ||
        item.type ||
        item.cargo_type ||
        '';

    if (!name) {
        return null;
    }

    return {
        id: item.id || item.value || name,
        name,
        raw: item,
    };
}

export function normalizeCargoTypesResponse(response) {
    return unwrapCargoTypesResponse(response)
        .map(normalizeCargoType)
        .filter(Boolean);
}

export async function fetchCustomerCargoTypesApi() {
    const response = await apiClient.get('/customer/v1/cargo-types');

    return normalizeCargoTypesResponse(response);
}

export async function searchCustomerCargoTypesApi(search) {
    const response = await apiClient.get('/customer/v1/cargo-types/search', {
        params: {
            search,
        },
    });

    return normalizeCargoTypesResponse(response);
}
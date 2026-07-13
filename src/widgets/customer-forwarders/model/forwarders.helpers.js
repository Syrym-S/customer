export const FORWARDERS_PER_PAGE = 10;

export function normalizeForwardersListResponse(response) {
    const forwarders = Array.isArray(response?.results) ? response.results : [];

    return {
        forwarders,
        page: Number(response?.page || 1),
        perPage: Number(response?.per_page || FORWARDERS_PER_PAGE),
        total: Number(response?.count || 0),
    };
}

export function getForwarderId(forwarder) {
    return forwarder?.id || forwarder?._id || '';
}

export function getForwarderCompanyName(forwarder) {
    return (
        forwarder?.name ||
        forwarder?.company_name ||
        forwarder?.companyName ||
        'Компания не указана'
    );
}

export function getForwarderBin(forwarder) {
    return forwarder?.company_bin || 'Не указан';
}

export function getForwarderIin(forwarder) {
    return forwarder?.iin || 'Не указан';
}

export function getForwarderFio(forwarder) {
    return (
        forwarder?.fio ||
        forwarder?.fullname ||
        forwarder?.fullName ||
        'Не указан'
    );
}

export function getForwarderPhone(forwarder) {
    return forwarder?.phone || 'Не указан';
}

export function getForwarderAddress(forwarder) {
    return forwarder?.company_address || 'Не указан';
}

export function getForwarderBik(forwarder) {
    return forwarder?.company_bik || 'Не указан';
}

export function getForwarderAccount(forwarder) {
    return forwarder?.company_account || 'Не указан';
}

function getForwardersList(response) {
    if (Array.isArray(response)) {
        return response;
    }

    if (Array.isArray(response?.results)) {
        return response.results;
    }

    if (Array.isArray(response?.data)) {
        return response.data;
    }

    if (Array.isArray(response?.forwarders)) {
        return response.forwarders;
    }

    return [];
}

export function mapForwarderFromApi(apiForwarder) {
    return {
        id: apiForwarder.id ?? apiForwarder._id ?? apiForwarder.ID ?? '',

        fullName:
            apiForwarder.fullName ??
            apiForwarder.full_name ??
            apiForwarder.fio ??
            apiForwarder.name ??
            'Без ФИО',

        iin: apiForwarder.iin ?? apiForwarder.IIN ?? '',

        companyName:
            apiForwarder.companyName ??
            apiForwarder.company_name ??
            apiForwarder.company?.name ??
            apiForwarder.organization?.name ??
            'Без компании',

        companyBin:
            apiForwarder.companyBin ??
            apiForwarder.company_bin ??
            apiForwarder.company?.bin ??
            apiForwarder.organization?.bin ??
            '',

        phone:
            apiForwarder.phone ??
            apiForwarder.phoneNumber ??
            apiForwarder.phone_number ??
            '',

        raw: apiForwarder,
    };
}

export function mapForwardersResponseFromApi(response) {
    return getForwardersList(response)
        .map(mapForwarderFromApi)
        .filter((forwarder) => Boolean(forwarder.id));
}

export function mapForwarderSearchItemFromApi(item) {
    return {
        id: item.id,
        fullName: item.fio || '',
        companyName: item.name || '',
        companyBin: item.bin || '',
        phone: item.phone || '',
        iin: item.iin || '',
    };
}

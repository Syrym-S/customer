export const INITIAL_VISIBLE_COUNT = 3;

export const participantTypeLabels = {
    forwarder: 'Экспедитор',
};

export function formatDateTime(value) {
    if (!value) return 'Не указано';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function getParticipantForwarderId(participant) {
    return (
        participant?.participant_id ||
        participant?.forwarder_id ||
        participant?.forwarderId ||
        participant?.id ||
        ''
    );
}

export function normalizeForwarderOption(forwarder) {
    if (!forwarder) {
        return null;
    }

    return {
        id: forwarder.id,

        fullName:
            forwarder.fullName ||
            forwarder.full_name ||
            forwarder.fio ||
            forwarder.name ||
            'Без имени',

        iin: forwarder.iin || forwarder.personIin || '',

        companyName:
            forwarder.companyName ||
            forwarder.company_name ||
            forwarder.name ||
            'Без компании',

        companyBin:
            forwarder.companyBin ||
            forwarder.company_bin ||
            forwarder.bin ||
            '',

        phone: forwarder.phone || forwarder.tel || '',

        raw: forwarder.raw || forwarder,
    };
}

export function getForwardersFromResponse(response) {
    const data = response?.data ?? response;

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data?.results)) return data.data.results;
    if (Array.isArray(data?.data)) return data.data;

    return [];
}

export function normalizeForwardersOptions(response) {
    return getForwardersFromResponse(response)
        .map(normalizeForwarderOption)
        .filter((forwarder) => forwarder?.id);
}

export function getForwarderSearchText(forwarder) {
    return [
        forwarder.fullName,
        forwarder.companyName,
        forwarder.companyBin,
        forwarder.iin,
        forwarder.phone,
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
}

export function filterForwardersLocally(forwarders, query) {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
        return forwarders;
    }

    return forwarders.filter((forwarder) =>
        getForwarderSearchText(forwarder).includes(normalizedQuery),
    );
}

export function formatMoney(amount, currency = 'KZT') {
    if (amount === null || amount === undefined || amount === '') {
        return 'Не указано';
    }

    return `${Number(amount).toLocaleString('ru-RU')} ${currency || 'KZT'}`;
}

export function normalizeLeadsResponse(response) {
    if (Array.isArray(response)) {
        return response;
    }

    if (Array.isArray(response?.data)) {
        return response.data;
    }

    if (Array.isArray(response?.results)) {
        return response.results;
    }

    if (Array.isArray(response?.items)) {
        return response.items;
    }

    return [];
}

export function formatPercent(value) {
    if (value === null || value === undefined || value === '') {
        return 'Не указано';
    }

    return `${(Number(value) * 100).toFixed(1)}%`;
}

export function formatDate(value) {
    if (!value) {
        return 'Не указано';
    }

    let dateValue = value;

    if (typeof value === 'object') {
        dateValue =
            value.date ||
            value.datetime ||
            value.value ||
            value.created_at ||
            '';

        if (!dateValue) {
            return 'Не указано';
        }
    }

    const normalizedDateValue =
        typeof dateValue === 'string' ? dateValue.replace(' ', 'T') : dateValue;

    const date = new Date(normalizedDateValue);

    if (Number.isNaN(date.getTime())) {
        return String(dateValue || 'Не указано');
    }

    return date.toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function getFactoringStatusLabel(status) {
    const labels = {
        new: 'Новый',
        verified_participant: 'Один участник подтвердил',
        await_paid: 'Ожидает оплаты',
        finished: 'Завершён',
        cancelled: 'Отменён',
    };

    return labels[status] || status || 'Не указано';
}

export function getFactoringStatusColor(status) {
    const colors = {
        new: 'info',
        verified_participant: 'warning',
        await_paid: 'primary',
        finished: 'success',
        cancelled: 'error',
    };

    return colors[status] || 'default';
}

export function getVerificationLabel(value) {
    return value ? 'Подтверждено' : 'Не подтверждено';
}

export function getVerificationColor(value) {
    return value ? 'success' : 'default';
}

export function getCustomerName(customer) {
    return customer?.fullname || customer?.fullName || customer?.name || '—';
}

// Factorings are consumed as the raw API shape directly (no adapter/mapper
// file exists for them, unlike leads' lead.adapter.js) — `lead_id` is
// already present as-is on the raw object. Confirmed: the chat backend
// requires this lead_id for a factoring's chat URLs, not the factoring's
// own id (see chat-widget's FactoringChatButton.jsx) — this is also
// FactoringsProvider.jsx's existing lookup, extracted here so both places
// share one implementation instead of two copies of the same fallback
// chain.
export function getFactoringLeadId(factoring) {
    return (
        factoring?.lead_id || factoring?.leadId || factoring?.lead?.id || ''
    );
}

export function getForwarderName(forwarder) {
    return forwarder?.company_name || forwarder?.companyName || '—';
}

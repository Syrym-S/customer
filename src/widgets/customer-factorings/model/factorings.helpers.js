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

export function isFinishedLead(lead) {
    return String(lead?.status || '').toLowerCase() === 'finished';
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
        new: 'Новая',
        pending: 'В обработке',
        approved: 'Одобрена',
        rejected: 'Отклонена',
        completed: 'Завершена',
    };

    return labels[status] || status || 'Не указано';
}

export function getFactoringStatusColor(status) {
    const colors = {
        new: 'info',
        pending: 'warning',
        approved: 'success',
        rejected: 'error',
        completed: 'success',
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

export function getForwarderName(forwarder) {
    return forwarder?.company_name || forwarder?.companyName || '—';
}

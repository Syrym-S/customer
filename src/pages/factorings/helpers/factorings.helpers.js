export function formatMoney(amount, currency = 'KZT') {
    if (amount === null || amount === undefined || amount === '') {
        return 'Не указано';
    }

    return `${Number(amount).toLocaleString('ru-RU')} ${currency || 'KZT'}`;
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

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
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

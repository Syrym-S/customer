import { formatAmount } from '../../../shared/helpers/currency-format.helpers';
import i18n from '../../../shared/i18n';

export function formatMoney(amount, currency = 'KZT') {
    const formattedAmount = formatAmount(amount);

    if (!formattedAmount) {
        return i18n.t("common.empty.notSpecifiedN");
    }

    return `${formattedAmount} ${currency || 'KZT'}`;
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
        return i18n.t("common.empty.notSpecifiedN");
    }

    return `${(Number(value) * 100).toFixed(1)}%`;
}

export function formatDate(value) {
    if (!value) {
        return i18n.t("common.empty.notSpecifiedN");
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
            return i18n.t("common.empty.notSpecifiedN");
        }
    }

    const normalizedDateValue =
        typeof dateValue === 'string' ? dateValue.replace(' ', 'T') : dateValue;

    const date = new Date(normalizedDateValue);

    if (Number.isNaN(date.getTime())) {
        return String(dateValue || i18n.t("common.empty.notSpecifiedN"));
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
        new: i18n.t("enums.factoringStatus.new"),
        verified_participant: i18n.t("enums.factoringStatus.verified_participant"),
        await_paid: i18n.t("enums.factoringStatus.await_paid"),
        finished: i18n.t("enums.factoringStatus.finished"),
        cancelled: i18n.t("enums.factoringStatus.cancelled"),
    };

    return labels[status] || status || i18n.t("common.empty.notSpecifiedN");
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
    return value ? i18n.t("enums.verification.confirmed") : i18n.t("enums.verification.notConfirmed");
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

// `is_line: true` marks a closed factoring (it has its own factoring-line
// document/signature), returned both in the factorings list and details.
export function getFactoringLineTypeLabel(isLine) {
    return isLine ? i18n.t("enums.factoringLine.closed") : i18n.t("enums.factoringLine.open");
}

export function getFactoringLineTypeColor(isLine) {
    return isLine ? 'secondary' : 'default';
}

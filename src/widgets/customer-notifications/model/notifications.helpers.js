import i18n from '../../../shared/i18n';

import {
    getNotificationMessageText,
    getNotificationThemeText,
} from '../lib/notification-texts';

export function normalizeNotificationsResponse(response) {
    if (Array.isArray(response)) {
        return response;
    }

    if (Array.isArray(response?.results)) {
        return response.results;
    }

    if (Array.isArray(response?.data)) {
        return response.data;
    }

    if (Array.isArray(response?.data?.results)) {
        return response.data.results;
    }

    if (Array.isArray(response?.notifications)) {
        return response.notifications;
    }

    if (Array.isArray(response?.items)) {
        return response.items;
    }

    return [];
}

export function normalizeNotificationDetailsResponse(response) {
    if (!response) {
        return null;
    }

    if (response?.result && typeof response.result === 'object') {
        return response.result;
    }

    if (response?.data && typeof response.data === 'object') {
        return response.data;
    }

    if (response?.notification && typeof response.notification === 'object') {
        return response.notification;
    }

    return response;
}

export function getNotificationId(notification) {
    return notification?.id || '';
}

export function getNotificationTitle(notification) {
    return (
        getNotificationThemeText(notification) ||
        i18n.t("common.severity.notice")
    );
}

export function getNotificationDescription(notification) {
    return (
        getNotificationMessageText(notification) ||
        i18n.t("notifications.noDescription")
    );
}

export function getNotificationCreatedAt(notification) {
    return notification?.created_at || '';
}

export function getNotificationLink(notification) {
    return notification?.link || '';
}

export function isRealtimeOnlyNotification(notification) {
    return notification?.is_realtime_only === true;
}

const DATE_LOCALE_BY_LANGUAGE = {
    ru: 'ru-RU',
    kk: 'kk-KZ',
    en: 'en-US',
};

function getDateLocale() {
    const language = i18n.resolvedLanguage || i18n.language || 'ru';

    return DATE_LOCALE_BY_LANGUAGE[language] || DATE_LOCALE_BY_LANGUAGE.ru;
}

const CUSTOMER_ENTITY_PATH_SEGMENTS = ['leads', 'tenders', 'factorings'];

const CUSTOMER_PATH_PREFIX = '/customer';

export function resolveCustomerNotificationAppPath(pathname) {
    const normalizedPathname = String(pathname || '');

    for (const segment of CUSTOMER_ENTITY_PATH_SEGMENTS) {
        if (
            normalizedPathname.startsWith(
                `${CUSTOMER_PATH_PREFIX}/${segment}/`,
            )
        ) {
            return normalizedPathname;
        }

        if (normalizedPathname.startsWith(`/${segment}/`)) {
            return `${CUSTOMER_PATH_PREFIX}${normalizedPathname}`;
        }
    }

    return '';
}

export function isNotificationUnread(notification) {
    return notification?.is_viewed === false;
}

export function formatNotificationDate(value) {
    if (!value) {
        return i18n.t("common.empty.dateNotSpecified");
    }

    let dateValue = value;

    if (typeof value === 'object') {
        dateValue = value.date || value.datetime || value.value || '';

        if (!dateValue) {
            return i18n.t("common.empty.dateNotSpecified");
        }
    }

    const normalizedValue =
        typeof dateValue === 'string'
            ? dateValue.replace(' ', 'T')
            : dateValue;

    const date = new Date(normalizedValue);

    if (Number.isNaN(date.getTime())) {
        return String(dateValue || i18n.t("common.empty.dateNotSpecified"));
    }

    return date.toLocaleString(getDateLocale(), {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
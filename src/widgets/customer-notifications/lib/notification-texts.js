import i18n from '../../../shared/i18n';

import { resolveNotificationType } from './notification-payload';

const TYPES_KEY_PREFIX = 'notifications.types';

const TRIP_NUMBER_PATTERN = /№\s*([0-9]+)/;

const MANUFACTURER_NAME_PATTERN =
    /Производитель\s+(.+?)\s+(?:хочет|одобрил|отклонил|отвязался|отозвал)/;

function readCatalogTemplate(key) {
    const template = i18n.getResource('ru', 'translation', key);

    return typeof template === 'string' ? template : '';
}

export function getNotificationCatalogType(notification, field) {
    const type = resolveNotificationType(notification);

    if (!type) {
        return '';
    }

    const segments = String(type).split('.');

    while (segments.length) {
        const candidate = segments.join('.');

        if (readCatalogTemplate(`${TYPES_KEY_PREFIX}.${candidate}.${field}`)) {
            return candidate;
        }

        segments.pop();
    }

    return '';
}

function extractTripNumber(notification) {
    const source = `${notification?.theme || ''} ${notification?.message || ''}`;
    const match = source.match(TRIP_NUMBER_PATTERN);

    return match ? match[1] : '';
}

function extractManufacturerName(notification) {
    const match = String(notification?.message || '').match(
        MANUFACTURER_NAME_PATTERN,
    );

    return match ? match[1].trim() : '';
}

function hasPlaceholder(template, name) {
    return template.includes(`{{${name}}}`);
}

function translateField(notification, field, fallback) {
    const catalogType = getNotificationCatalogType(notification, field);

    if (!catalogType) {
        return fallback;
    }

    const key = `${TYPES_KEY_PREFIX}.${catalogType}.${field}`;
    const template = readCatalogTemplate(key);
    const params = {};

    if (hasPlaceholder(template, 'num')) {
        params.num = extractTripNumber(notification);

        if (!params.num) {
            return fallback;
        }
    }

    if (hasPlaceholder(template, 'name')) {
        params.name = extractManufacturerName(notification);

        if (!params.name) {
            return fallback;
        }
    }

    return i18n.t(key, params);
}

export function getNotificationThemeText(notification) {
    return translateField(notification, 'theme', notification?.theme || '');
}

export function getNotificationMessageText(notification) {
    return translateField(notification, 'message', notification?.message || '');
}

import { isStaging } from '../../../shared/api/api-client';
import { getCurrentUserId } from '../../../shared/helpers/current-user.helpers';

export const NOTIFICATION_TRANSPORT_DRIVERS = {
    RAW_WS: 'raw-ws',
    REVERB: 'reverb',
};

const RAW_WS_DRIVER_ALIASES = new Set(['raw-ws', 'raw', 'ws', 'legacy', 'old']);
const REVERB_DRIVER_ALIASES = new Set(['reverb', 'echo', 'laravel-echo', 'new']);

const NOTIFICATION_WS_BASE_URL = 'wss://notification.360logistics.kz';

export const DEFAULT_NOTIFICATION_WS_URL = isStaging
    ? `${NOTIFICATION_WS_BASE_URL}/staging/socket`
    : `${NOTIFICATION_WS_BASE_URL}/socket`;

export const NOTIFICATION_CHANNEL_ROLE = 'customer';

const BROADCASTING_AUTH_PATH = '/api/broadcasting/auth';

export function isNotificationRealtimeConfigPresent() {
    const config = window.NotifWS_Config || window.NotificationWS_Config;

    return Boolean(
        config &&
            typeof config === 'object' &&
            Object.keys(config).length > 0,
    );
}

export function getNotificationRealtimeConfig() {
    const config = window.NotifWS_Config || window.NotificationWS_Config || {};

    const reverbHost = String(
        config.reverb_host || config.reverbHost || '',
    ).trim();

    return {
        driver: String(config.driver || '')
            .trim()
            .toLowerCase(),
        ws: config.ws || config.wsUrl || config.url || '',
        reverbHost,
        reverbKey: String(config.reverb_key || config.reverbKey || '').trim(),
        authEndpoint:
            config.auth ||
            config.authEndpoint ||
            (reverbHost ? `https://${reverbHost}${BROADCASTING_AUTH_PATH}` : ''),
        userId: config.user ?? config.user_id ?? getCurrentUserId(),
        role: String(config.role || NOTIFICATION_CHANNEL_ROLE).trim(),
        channel: config.channel || '',
        event: config.event || '',
        debug: Boolean(config.debug),
    };
}

function stripPrivatePrefix(channel) {
    return String(channel || '')
        .trim()
        .replace(/^private-/, '');
}

export function resolveNotificationChannelName(channelFromToken = '') {
    const config = getNotificationRealtimeConfig();
    const explicitChannel = stripPrivatePrefix(
        channelFromToken || config.channel,
    );

    if (explicitChannel) {
        return explicitChannel;
    }

    if (!config.role || !config.userId) {
        return '';
    }

    return `notifications.${config.role}.${config.userId}`;
}

export function resolveNotificationTransportDriver() {
    const { driver, reverbHost, reverbKey } = getNotificationRealtimeConfig();

    if (REVERB_DRIVER_ALIASES.has(driver)) {
        return NOTIFICATION_TRANSPORT_DRIVERS.REVERB;
    }

    if (RAW_WS_DRIVER_ALIASES.has(driver)) {
        return NOTIFICATION_TRANSPORT_DRIVERS.RAW_WS;
    }

    if (reverbHost && reverbKey) {
        return NOTIFICATION_TRANSPORT_DRIVERS.REVERB;
    }

    return NOTIFICATION_TRANSPORT_DRIVERS.RAW_WS;
}

export function isNotificationRealtimeDebugEnabled() {
    return getNotificationRealtimeConfig().debug;
}

export function debugNotificationRealtime(...args) {
    if (isNotificationRealtimeDebugEnabled()) {
        console.log(...args);
    }
}

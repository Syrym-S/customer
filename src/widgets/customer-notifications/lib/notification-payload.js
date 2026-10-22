const DOMAIN_TYPE_PATTERN = /^[a-z0-9_]+(\.[a-z0-9_-]+)*$/;

export function isNotificationPayloadShape(payload) {
    return Boolean(payload?.theme && payload?.message);
}

export function extractNotificationFromPayload(payload) {
    if (!payload) {
        return null;
    }

    if (isNotificationPayloadShape(payload)) {
        return normalizeNotificationPayload(payload);
    }

    if (
        payload.notification &&
        typeof payload.notification === 'object' &&
        isNotificationPayloadShape(payload.notification)
    ) {
        return normalizeNotificationPayload(payload.notification);
    }

    if (
        payload.data &&
        typeof payload.data === 'object' &&
        isNotificationPayloadShape(payload.data)
    ) {
        return normalizeNotificationPayload(payload.data);
    }

    if (
        payload.data?.notification &&
        typeof payload.data.notification === 'object' &&
        isNotificationPayloadShape(payload.data.notification)
    ) {
        return normalizeNotificationPayload(payload.data.notification);
    }

    if (
        payload.result &&
        typeof payload.result === 'object' &&
        isNotificationPayloadShape(payload.result)
    ) {
        return normalizeNotificationPayload(payload.result);
    }

    return null;
}

export function resolveNotificationType(notification) {
    const candidates = [
        notification?.type,
        notification?.event_type,
        notification?.eventType,
        notification?.notification_type,
        notification?.notificationType,
        notification?.data?.type,
    ]
        .map((candidate) => String(candidate || '').trim())
        .filter(Boolean);

    const domainType = candidates.find((candidate) =>
        DOMAIN_TYPE_PATTERN.test(candidate),
    );

    return domainType || candidates[0] || '';
}

export function normalizeNotificationPayload(notification) {
    const fallbackId = [
        notification.type,
        notification.link,
        notification.theme,
        notification.message,
    ]
        .filter(Boolean)
        .join('|');

    return {
        id: notification.id || fallbackId || Date.now(),
        theme: notification.theme,
        message: notification.message,
        link: notification.link || '',
        queue: notification.queue || notification.source || '',
        is_viewed: false,
        created_at: notification.created_at || new Date().toISOString(),
        is_realtime_only: !notification.id,
        ...notification,
        type: resolveNotificationType(notification),
    };
}

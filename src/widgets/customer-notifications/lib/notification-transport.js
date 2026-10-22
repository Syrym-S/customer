import {
    NOTIFICATION_TRANSPORT_DRIVERS,
    isNotificationRealtimeConfigPresent,
    resolveNotificationTransportDriver,
} from './notification-realtime-config';
import {
    isRawWsNotificationTransportConfigured,
    openRawWsNotificationTransport,
} from './transports/raw-ws.transport';
import {
    isReverbNotificationTransportConfigured,
    openReverbNotificationTransport,
} from './transports/reverb.transport';

const CONFIG_WAIT_TIMEOUT_MS = 10000;
const CONFIG_POLL_INTERVAL_MS = 200;

function openResolvedTransport(handlers) {
    if (
        resolveNotificationTransportDriver() ===
        NOTIFICATION_TRANSPORT_DRIVERS.REVERB
    ) {
        return openReverbNotificationTransport(handlers);
    }

    return openRawWsNotificationTransport(handlers);
}

export function openNotificationsRealtimeConnection(handlers) {
    if (isNotificationRealtimeConfigPresent()) {
        return openResolvedTransport(handlers);
    }

    let connection = null;
    let pollTimerId = null;
    let isClosed = false;

    const deadline = Date.now() + CONFIG_WAIT_TIMEOUT_MS;

    function openNow() {
        pollTimerId = null;

        if (isClosed) {
            return;
        }

        connection = openResolvedTransport(handlers);
    }

    function waitForConfig() {
        if (isClosed) {
            return;
        }

        if (
            isNotificationRealtimeConfigPresent() ||
            Date.now() >= deadline
        ) {
            openNow();
            return;
        }

        pollTimerId = setTimeout(waitForConfig, CONFIG_POLL_INTERVAL_MS);
    }

    waitForConfig();

    return {
        close() {
            isClosed = true;

            if (pollTimerId) {
                clearTimeout(pollTimerId);
                pollTimerId = null;
            }

            connection?.close();
            connection = null;
        },
    };
}

export function isNotificationsRealtimeConfigured() {
    if (
        resolveNotificationTransportDriver() ===
        NOTIFICATION_TRANSPORT_DRIVERS.REVERB
    ) {
        return isReverbNotificationTransportConfigured();
    }

    return isRawWsNotificationTransportConfigured();
}

export { NOTIFICATION_TRANSPORT_DRIVERS, resolveNotificationTransportDriver };

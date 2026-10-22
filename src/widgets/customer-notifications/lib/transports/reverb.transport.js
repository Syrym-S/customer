import {
    createReverbEcho,
    disconnectReverbEcho,
} from '../../../../shared/lib/realtime/create-reverb-echo';
import { fetchNotificationWsTokenApi } from '../../api/notifications-ws.api';
import { extractNotificationFromPayload } from '../notification-payload';
import {
    debugNotificationRealtime,
    getNotificationRealtimeConfig,
    resolveNotificationChannelName,
} from '../notification-realtime-config';

const MAX_AUTH_RETRIES = 2;

const DEFAULT_NOTIFICATION_EVENT = 'notification';

const BASE_RECONNECT_DELAY_MS = 1000;
const MAX_RECONNECT_DELAY_MS = 30000;

function isChannelAuthError(subscriptionError) {
    const status = subscriptionError?.status;

    return (
        subscriptionError?.type === 'AuthError' &&
        (status === 401 || status === 403)
    );
}

function isFalsyTokenResponse(response) {
    return (
        !response ||
        response.success === false ||
        response.status === false ||
        response.error
    );
}

function readTokenResponseFields(response) {
    const sources = [response, response?.data, response?.result].filter(
        (source) => source && typeof source === 'object',
    );

    function pick(...keys) {
        for (const source of sources) {
            for (const key of keys) {
                if (source[key]) {
                    return source[key];
                }
            }
        }

        return '';
    }

    return {
        token: pick('token', 'access_token', 'accessToken'),
        channel: pick('channel', 'channel_name', 'channelName'),
        event: pick('event', 'event_name', 'eventName'),
        authEndpoint: pick('auth_endpoint', 'authEndpoint'),
    };
}

export function isReverbNotificationTransportConfigured() {
    const { reverbHost, reverbKey } = getNotificationRealtimeConfig();

    return Boolean(reverbHost && reverbKey);
}

export function openReverbNotificationTransport({
    onOpen,
    onClose,
    onError,
    onAuthFailed,
    onNotification,
    onMessage,
}) {
    const abortController = new AbortController();

    let echo = null;
    let unbindConnectionChange = null;
    let isClosed = false;
    let authRetryCount = 0;
    let reconnectTimerId = null;
    let reconnectAttempt = 0;

    function reportError(message, error) {
        console.error(message, error);
        onError?.(error);
    }

    function clearReconnectTimer() {
        if (reconnectTimerId) {
            clearTimeout(reconnectTimerId);
            reconnectTimerId = null;
        }
    }

    function teardownEcho() {
        if (unbindConnectionChange) {
            try {
                unbindConnectionChange();
            } catch (error) {
                console.warn(
                    'NotificationWS (reverb): could not unbind connection listener',
                    error,
                );
            }

            unbindConnectionChange = null;
        }

        disconnectReverbEcho(echo, 'NotificationWS (reverb)');
        echo = null;
    }

    function scheduleRestart() {
        if (isClosed) {
            return;
        }

        clearReconnectTimer();
        teardownEcho();

        const delay = Math.min(
            BASE_RECONNECT_DELAY_MS * 2 ** reconnectAttempt,
            MAX_RECONNECT_DELAY_MS,
        );

        reconnectAttempt += 1;

        reconnectTimerId = setTimeout(() => {
            reconnectTimerId = null;
            start();
        }, delay);
    }

    function handleNotificationEvent(payload) {
        debugNotificationRealtime('[NotificationWS reverb message]', payload);

        onMessage?.(payload);

        const notification = extractNotificationFromPayload(payload);

        if (notification) {
            onNotification?.(notification, payload);
            return;
        }

        debugNotificationRealtime(
            '[NotificationWS reverb unrecognized payload]',
            payload,
        );
    }

    async function start() {
        try {
            const config = getNotificationRealtimeConfig();

            if (!config.reverbHost || !config.reverbKey) {
                console.warn(
                    'NotificationWS (reverb): window.NotifWS_Config has no reverb_host/reverb_key — live notifications skipped.',
                );
                return;
            }

            const tokenResponse = await fetchNotificationWsTokenApi({
                signal: abortController.signal,
            });

            if (isClosed) {
                return;
            }

            if (isFalsyTokenResponse(tokenResponse)) {
                throw new Error(
                    tokenResponse?.message ||
                        'Notification WS token endpoint returned error',
                );
            }

            const tokenFields = readTokenResponseFields(tokenResponse);

            if (!tokenFields.token) {
                throw new Error('Notification WS token was not returned');
            }

            const channelName = resolveNotificationChannelName(
                tokenFields.channel,
            );

            if (!channelName) {
                throw new Error(
                    'NotificationWS (reverb): channel is unknown — no channel in token response/config and no user id (NotifWS_Config.user / APP_DATA.user_id)',
                );
            }

            const authEndpoint =
                tokenFields.authEndpoint || config.authEndpoint;

            if (!authEndpoint) {
                throw new Error(
                    'NotificationWS (reverb): auth endpoint is unknown — expected reverb_host in config or auth_endpoint in token response',
                );
            }

            echo = createReverbEcho({
                key: config.reverbKey,
                wsHost: config.reverbHost,
                authEndpoint,
                token: tokenFields.token,
            });

            if (isClosed) {
                teardownEcho();
                return;
            }

            unbindConnectionChange =
                echo.connector?.onConnectionChange?.((status) => {
                    debugNotificationRealtime(
                        '[NotificationWS reverb status]',
                        status,
                    );

                    if (status === 'connected') {
                        authRetryCount = 0;
                        reconnectAttempt = 0;
                        onOpen?.();
                        return;
                    }

                    if (status === 'disconnected' || status === 'failed') {
                        onClose?.({ status });
                    }
                }) ?? null;

            echo.connector?.pusher?.connection?.bind?.('error', (wsError) => {
                reportError(
                    'NotificationWS (reverb): connection error',
                    wsError,
                );
            });

            const eventName =
                tokenFields.event ||
                config.event ||
                DEFAULT_NOTIFICATION_EVENT;

            const channel = echo
                .private(channelName)
                .listen(
                    eventName.startsWith('.') ? eventName : `.${eventName}`,
                    handleNotificationEvent,
                );

            debugNotificationRealtime(
                `[NotificationWS reverb subscribed] private-${channelName} / .${eventName}`,
            );

            try {
                channel?.error?.((subscriptionError) => {
                    if (isClosed) {
                        return;
                    }

                    if (
                        isChannelAuthError(subscriptionError) &&
                        authRetryCount < MAX_AUTH_RETRIES
                    ) {
                        authRetryCount += 1;

                        console.warn(
                            `NotificationWS (reverb): channel auth failed for ${channelName} (status ${subscriptionError.status}), refetching token (attempt ${authRetryCount}/${MAX_AUTH_RETRIES})`,
                            subscriptionError,
                        );

                        teardownEcho();
                        start();
                        return;
                    }

                    if (isChannelAuthError(subscriptionError)) {
                        onAuthFailed?.(subscriptionError);
                        return;
                    }

                    reportError(
                        `NotificationWS (reverb): subscription error for ${channelName}`,
                        subscriptionError,
                    );
                });
            } catch (bindError) {
                console.warn(
                    'NotificationWS (reverb): could not bind channel error handler',
                    bindError,
                );
            }
        } catch (error) {
            if (error.name === 'AbortError' || isClosed) {
                return;
            }

            reportError(
                error.message ||
                    'Failed to open NotificationWS (reverb) connection',
                error,
            );

            scheduleRestart();
        }
    }

    start();

    return {
        close() {
            if (isClosed) {
                return;
            }

            isClosed = true;
            abortController.abort();
            clearReconnectTimer();
            teardownEcho();
        },
    };
}

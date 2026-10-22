import { fetchNotificationWsTokenApi } from '../../api/notifications-ws.api';
import { extractNotificationFromPayload } from '../notification-payload';
import {
    DEFAULT_NOTIFICATION_WS_URL,
    debugNotificationRealtime,
    getNotificationRealtimeConfig,
} from '../notification-realtime-config';

const MAX_RECONNECT_DELAY_MS = 30000;
const BASE_RECONNECT_DELAY_MS = 1000;
const MAX_AUTH_FAILURES = 3;

const WS_ERROR_MESSAGE_TYPE = 'error';
const ACCESS_ALLOWED_MESSAGE = 'access allowed';
const CONTROL_MESSAGE_TYPES = new Set(['ping', 'pong']);

const AUTH_FAILURE_MESSAGE_MARKERS = [
    'auth',
    'token',
    'invalid',
    'unauthorized',
];

function normalizeNotificationWsUrl(value) {
    if (!value) {
        return DEFAULT_NOTIFICATION_WS_URL;
    }

    const hasProtocol = /^wss?:\/\//i.test(value);
    const url = new URL(hasProtocol ? value : `wss://${value}`);

    if (!url.pathname || url.pathname === '/') {
        url.pathname = '/socket';
    }

    return url.toString();
}

function getWsUrl() {
    const { ws } = getNotificationRealtimeConfig();

    return normalizeNotificationWsUrl(ws || DEFAULT_NOTIFICATION_WS_URL);
}

function getErrorMessage(error, fallbackMessage) {
    return error?.response?.data?.message || error?.message || fallbackMessage;
}

function isFalsyTokenResponse(response) {
    return (
        !response ||
        response.success === false ||
        response.status === false ||
        response.error
    );
}

function isAccessAllowedPayload(payload) {
    return (
        String(payload?.message || '').toLowerCase() === ACCESS_ALLOWED_MESSAGE
    );
}

function isControlPayload(payload) {
    return CONTROL_MESSAGE_TYPES.has(
        String(payload?.type || '')
            .trim()
            .toLowerCase(),
    );
}

function isAuthFailedPayload(payload) {
    if (!payload || payload.type !== WS_ERROR_MESSAGE_TYPE) {
        return false;
    }

    const message = String(payload.message || '').toLowerCase();

    return AUTH_FAILURE_MESSAGE_MARKERS.some((marker) =>
        message.includes(marker),
    );
}

export function connectNotificationWS({ wsUrl, token }) {
    if (!wsUrl) {
        throw new Error('Notification WS URL not configured');
    }

    if (!token) {
        throw new Error('Notification WS token missing');
    }

    const url = new URL(wsUrl);

    url.searchParams.set('token', token);

    return new WebSocket(url.toString());
}

export function bindNotificationWS(ws, handlers = {}) {
    const {
        onOpen,
        onClose,
        onError,
        onAuthFailed,
        onNotification,
        onMessage,
    } = handlers;

    ws.onopen = () => {
        debugNotificationRealtime('[NotificationWS opened]');
        onOpen?.();
    };

    ws.onerror = (event) => {
        console.error('[NotificationWS error]', event);
        onError?.(event);
    };

    ws.onclose = (event) => {
        debugNotificationRealtime('[NotificationWS closed]', event);
        onClose?.(event);
    };

    ws.onmessage = (event) => {
        let payload = null;

        try {
            payload = JSON.parse(event.data);
        } catch (error) {
            console.error('[NotificationWS parse error]', error);
            onError?.(error);
            return;
        }

        debugNotificationRealtime('[NotificationWS message]', payload);

        if (isAccessAllowedPayload(payload) || isControlPayload(payload)) {
            onMessage?.(payload);
            return;
        }

        if (isAuthFailedPayload(payload)) {
            onAuthFailed?.(payload);
            return;
        }

        onMessage?.(payload);

        const notification = extractNotificationFromPayload(payload);

        if (notification) {
            onNotification?.(notification, payload);
            return;
        }

        debugNotificationRealtime(
            '[NotificationWS unrecognized payload]',
            payload,
        );
    };
}

export function isRawWsNotificationTransportConfigured() {
    return Boolean(getWsUrl());
}

export function openRawWsNotificationTransport({
    onOpen,
    onClose,
    onError,
    onAuthFailed,
    onNotification,
    onMessage,
}) {
    const abortController = new AbortController();

    let ws = null;
    let isClosed = false;
    let hasGivenUp = false;
    let reconnectTimerId = null;
    let reconnectAttempt = 0;
    let authFailureCount = 0;

    function clearReconnectTimer() {
        if (reconnectTimerId) {
            clearTimeout(reconnectTimerId);
            reconnectTimerId = null;
        }
    }

    function scheduleReconnect() {
        if (isClosed || hasGivenUp) {
            return;
        }

        clearReconnectTimer();

        const exponent = Math.max(reconnectAttempt, authFailureCount);
        const delay = Math.min(
            BASE_RECONNECT_DELAY_MS * 2 ** exponent,
            MAX_RECONNECT_DELAY_MS,
        );

        reconnectAttempt += 1;

        reconnectTimerId = setTimeout(() => {
            start();
        }, delay);
    }

    async function start() {
        try {
            const wsUrl = getWsUrl();

            if (!wsUrl) {
                console.info('NotificationWS config is not available');
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

            if (!tokenResponse?.token) {
                throw new Error('Notification WS token was not returned');
            }

            ws = connectNotificationWS({
                wsUrl,
                token: tokenResponse.token,
            });

            bindNotificationWS(ws, {
                onOpen: () => {
                    reconnectAttempt = 0;

                    onOpen?.();
                },

                onClose: (event) => {
                    onClose?.(event);

                    if (!isClosed) {
                        scheduleReconnect();
                    }
                },

                onError: (event) => {
                    onError?.(event);
                },

                onAuthFailed: (payload) => {
                    authFailureCount += 1;

                    onAuthFailed?.(payload);

                    if (authFailureCount >= MAX_AUTH_FAILURES) {
                        hasGivenUp = true;

                        console.error(
                            `NotificationWS: authorization failed ${authFailureCount} times in a row — giving up`,
                            payload,
                        );
                    }

                    if (!isClosed) {
                        ws?.close();
                    }
                },

                onMessage: (payload) => {
                    authFailureCount = 0;

                    onMessage?.(payload);
                },

                onNotification,
            });
        } catch (error) {
            if (error.name === 'AbortError' || isClosed) {
                return;
            }

            const message = getErrorMessage(
                error,
                'Failed to open NotificationWS connection',
            );

            console.error(message, error);
            onError?.(error);

            scheduleReconnect();
        }
    }

    start();

    return {
        close() {
            isClosed = true;
            abortController.abort();
            clearReconnectTimer();

            if (
                ws &&
                (ws.readyState === WebSocket.OPEN ||
                    ws.readyState === WebSocket.CONNECTING)
            ) {
                ws.close();
            }

            ws = null;
        },
    };
}

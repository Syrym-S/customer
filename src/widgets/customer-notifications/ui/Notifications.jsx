import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from "react-i18next";
import {
    alpha,
    Alert,
    Badge,
    Box,
    Button,
    Chip,
    IconButton,
    Popover,
    Typography,
} from '@mui/material';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import {
    getNotificationId,
    isNotificationUnread,
    isRealtimeOnlyNotification,
    normalizeNotificationDetailsResponse,
    normalizeNotificationsResponse,
} from '../model/notifications.helpers';
import {
    fetchCustomerNotificationByIdApi,
    fetchCustomerNotificationsApi,
} from '../api/notifications.api';
import { NotificationDetailsModal } from './NotificationDetailsModal';
import {
    isNotificationsRealtimeConfigured,
    openNotificationsRealtimeConnection,
} from '../lib/notification-transport';
import { publishNotificationDomainEvent } from '../../../shared/model/notification-domain-events';
import {
    notifyRealtimeNotification,
    REALTIME_NOTIFICATION_TOAST_OPEN_EVENT,
} from '../../../shared/model/notifications.store';
import { NotificationsColumn } from './NotificationsColumn';
import { NotificationItem } from './NotificationItem';
import { NotificationState } from './NotificationState';

export function Notifications() {
    const { t } = useTranslation();

    const [anchorEl, setAnchorEl] = useState(null);

    const [notifications, setNotifications] = useState([]);
    const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);
    const [notificationsError, setNotificationsError] = useState('');

    const [selectedNotification, setSelectedNotification] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState('');

    const [isNotificationsDrawerOpen, setIsNotificationsDrawerOpen] =
        useState(false);
    const [notificationsRefreshKey, setNotificationsRefreshKey] = useState(0);

    const notificationWsConnectionRef = useRef(null);

    const isMenuOpen = Boolean(anchorEl);

    const unreadNotificationsCount =
        notifications.filter(isNotificationUnread).length;

    function blurActiveElement() {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
    }

    function handleOpenNotificationsDrawer() {
        handleCloseMenu();
        setIsNotificationsDrawerOpen(true);
    }

    function handleCloseNotificationsDrawer() {
        setIsNotificationsDrawerOpen(false);
    }

    async function loadNotifications({ withLoader = false } = {}) {
        try {
            if (withLoader) {
                setIsNotificationsLoading(true);
            }

            setNotificationsError('');

            const response = await fetchCustomerNotificationsApi();
            const nextNotifications = normalizeNotificationsResponse(response);

            setNotifications(nextNotifications);
        } catch (error) {
            setNotificationsError(
                error.response?.data?.message ||
                    error.response?.data?.error ||
                    error.message ||
                    t("notifications.loadFailed"),
            );
        } finally {
            if (withLoader) {
                setIsNotificationsLoading(false);
            }
        }
    }

    function handleOpenMenu(event) {
        const anchorElement = event.currentTarget;

        anchorElement.blur();
        setAnchorEl(anchorElement);

        loadNotifications({ withLoader: true });
    }

    function handleCloseMenu() {
        blurActiveElement();
        setAnchorEl(null);
    }

    const markNotificationAsViewed = useCallback(
        (notificationId, notificationDetails = null) => {
            if (!notificationId) {
                return;
            }

            setNotifications((prevNotifications) =>
                prevNotifications.map((notification) => {
                    const currentNotificationId =
                        getNotificationId(notification);

                    if (
                        String(currentNotificationId) !== String(notificationId)
                    ) {
                        return notification;
                    }

                    return {
                        ...notification,
                        ...(notificationDetails || {}),
                        is_viewed: true,
                    };
                }),
            );

            setNotificationsRefreshKey((prev) => prev + 1);
        },
        [],
    );

    const handleOpenNotificationDetails = useCallback(
        async (notification) => {
            const notificationId = getNotificationId(notification);

            if (!notificationId) {
                return;
            }

            blurActiveElement();
            setAnchorEl(null);

            setSelectedNotification(notification);
            setIsDetailsOpen(true);
            setDetailsError('');

            if (isRealtimeOnlyNotification(notification)) {
                markNotificationAsViewed(notificationId, {
                    ...notification,
                    is_viewed: true,
                });

                return;
            }

            try {
                setIsDetailsLoading(true);

                const response =
                    await fetchCustomerNotificationByIdApi(notificationId);

                const notificationDetails =
                    normalizeNotificationDetailsResponse(response);

                const nextSelectedNotification = {
                    ...(notificationDetails || notification),
                    is_viewed: true,
                };

                setSelectedNotification(nextSelectedNotification);

                markNotificationAsViewed(
                    notificationId,
                    nextSelectedNotification,
                );
            } catch (error) {
                setDetailsError(
                    error.response?.data?.message ||
                        error.response?.data?.error ||
                        error.message ||
                        t("notifications.singleLoadFailed"),
                );
            } finally {
                setIsDetailsLoading(false);
            }
        },
        [markNotificationAsViewed, t],
    );

    function handleCloseDetails() {
        if (isDetailsLoading) {
            return;
        }

        setIsDetailsOpen(false);
        setSelectedNotification(null);
        setDetailsError('');
    }

    useEffect(() => {
        let isCancelled = false;

        async function loadInitialNotifications() {
            try {
                const response = await fetchCustomerNotificationsApi();

                if (!isCancelled) {
                    setNotifications(normalizeNotificationsResponse(response));
                }
            } catch (error) {
                if (!isCancelled) {
                    setNotificationsError(
                        error.response?.data?.message ||
                            error.response?.data?.error ||
                            error.message ||
                            t("notifications.loadFailed"),
                    );
                }
            }
        }

        loadInitialNotifications();

        return () => {
            isCancelled = true;
        };
    }, [t]);

    useEffect(() => {
        notificationWsConnectionRef.current?.close();
        notificationWsConnectionRef.current = null;

        if (!isNotificationsRealtimeConfigured()) {
            console.info(
                'NotificationWS is not configured for this environment',
            );
            return;
        }

        const connection = openNotificationsRealtimeConnection({
            onOpen: () => {
                // console.info('NotificationWS opened');
            },

            onClose: (event) => {
                console.info('NotificationWS closed', event);
            },

            onError: (error) => {
                console.error('NotificationWS error', error);
            },

            onAuthFailed: (payload) => {
                console.error('NotificationWS auth failed', payload);
            },

            onNotification: (notification) => {
                setNotifications((prevNotifications) => {
                    const notificationId = getNotificationId(notification);

                    if (
                        notificationId &&
                        prevNotifications.some(
                            (item) =>
                                getNotificationId(item) === notificationId,
                        )
                    ) {
                        return prevNotifications.map((item) =>
                            getNotificationId(item) === notificationId
                                ? {
                                      ...item,
                                      ...notification,
                                  }
                                : item,
                        );
                    }

                    return [
                        {
                            is_viewed: false,
                            ...notification,
                        },
                        ...prevNotifications,
                    ];
                });

                notifyRealtimeNotification(notification);
                publishNotificationDomainEvent(notification);
            },
        });

        notificationWsConnectionRef.current = connection;

        return () => {
            connection.close();

            if (notificationWsConnectionRef.current === connection) {
                notificationWsConnectionRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        function handleOpenRealtimeNotificationToast(event) {
            const notification = event.detail?.notification;

            if (!notification) {
                return;
            }

            handleOpenNotificationDetails(notification);
        }

        window.addEventListener(
            REALTIME_NOTIFICATION_TOAST_OPEN_EVENT,
            handleOpenRealtimeNotificationToast,
        );

        return () => {
            window.removeEventListener(
                REALTIME_NOTIFICATION_TOAST_OPEN_EVENT,
                handleOpenRealtimeNotificationToast,
            );
        };
    }, [handleOpenNotificationDetails]);

    const previewNotifications = notifications.slice(0, 7);

    return (
        <>
            <IconButton
                onClick={handleOpenMenu}
                aria-label={t("notifications.title")}
                aria-expanded={isMenuOpen}
                sx={(theme) => ({
                    mx: { xs: 0, sm: 1 },
                    width: 40,
                    height: 40,
                    borderRadius: `${theme.radius.md}px`,
                    border: '1px solid',
                    borderColor: isMenuOpen ? 'primary.main' : 'divider',
                    color: 'primary.main',
                    bgcolor: isMenuOpen
                        ? alpha(theme.palette.primary.main, 0.08)
                        : 'background.paper',

                    '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                    },
                })}
            >
                <Badge
                    badgeContent={unreadNotificationsCount}
                    max={99}
                    color='error'
                >
                    <NotificationsNoneOutlinedIcon />
                </Badge>
            </IconButton>

            <Popover
                anchorEl={anchorEl}
                open={isMenuOpen}
                onClose={handleCloseMenu}
                // Same as the other header dropdowns: the page scroll is left
                // alone, so the scrollbar does not come and go.
                disableScrollLock
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                    paper: {
                        sx: (theme) => ({
                            mt: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: theme.customShadows.hover,
                        }),
                    },
                }}
            >
                <Box
                    sx={{
                        width: { xs: 'calc(100vw - 32px)', sm: 400 },
                        maxWidth: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        maxHeight: 'min(680px, 80dvh)',
                    }}
                >
                    <Box
                        sx={{
                            p: 2.5,
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: 18,
                                    fontWeight: 600,
                                    color: 'text.primary',
                                }}
                            >
                                {t("notifications.title")}
                            </Typography>

                            {unreadNotificationsCount > 0 && (
                                <Chip
                                    size='small'
                                    label={unreadNotificationsCount}
                                    color='primary'
                                    sx={{ height: 22, fontWeight: 600 }}
                                />
                            )}
                        </Box>

                        <Typography
                            sx={{
                                mt: 0.75,
                                fontSize: 13,
                                color: 'text.secondary',
                            }}
                        >
                            {t("notifications.subtitleDot")}
                        </Typography>
                    </Box>

                    <Box sx={{ overflowY: 'auto', minHeight: 0 }}>
                        {notificationsError ? (
                            <Alert severity='error' sx={{ m: 2 }}>
                                {notificationsError}
                            </Alert>
                        ) : isNotificationsLoading || !notifications.length ? (
                            <NotificationState
                                loading={isNotificationsLoading}
                            />
                        ) : (
                            <Box sx={{ p: 1.5, display: 'grid', gap: 1 }}>
                                {previewNotifications.map((notification) => (
                                    <NotificationItem
                                        key={getNotificationId(notification)}
                                        notification={notification}
                                        onOpen={handleOpenNotificationDetails}
                                    />
                                ))}
                            </Box>
                        )}
                    </Box>

                    <Box
                        sx={{
                            p: 1.5,
                            borderTop: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <Button
                            fullWidth
                            onClick={handleOpenNotificationsDrawer}
                            endIcon={<ArrowForwardRoundedIcon />}
                            sx={{ py: 1 }}
                        >
                            {t("notifications.all")}
                        </Button>
                    </Box>
                </Box>
            </Popover>

            <NotificationsColumn
                open={isNotificationsDrawerOpen}
                onClose={handleCloseNotificationsDrawer}
                onOpenNotificationDetails={handleOpenNotificationDetails}
                refreshKey={`${notifications.length}-${notificationsRefreshKey}`}
            />

            <NotificationDetailsModal
                open={isDetailsOpen}
                notification={selectedNotification}
                loading={isDetailsLoading}
                error={detailsError}
                onClose={handleCloseDetails}
            />
        </>
    );
}

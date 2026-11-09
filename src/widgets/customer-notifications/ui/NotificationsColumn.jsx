import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from "react-i18next";

import {
    Alert,
    Box,
    Drawer,
    IconButton,
    Pagination,
    Stack,
    Typography,
} from '@mui/material';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';

import { fetchCustomerNotificationsApi } from '../api/notifications.api';
import {
    getNotificationId,
    normalizeNotificationsResponse,
} from '../model/notifications.helpers';
import { NotificationItem } from './NotificationItem';
import { NotificationState } from './NotificationState';

const PER_PAGE = 10;

export function NotificationsColumn({
    open,
    onClose,
    onOpenNotificationDetails,
    refreshKey = 0,
}) {
    const { t } = useTranslation();

    const [notifications, setNotifications] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const pageCount = useMemo(
        () => Math.max(1, Math.ceil(total / PER_PAGE)),
        [total],
    );

    const loadNotifications = useCallback(
        async ({ withLoader = true, nextPage = page } = {}) => {
            try {
                if (withLoader) {
                    setIsLoading(true);
                }

                setError('');

                const response = await fetchCustomerNotificationsApi({
                    page: nextPage,
                    perPage: PER_PAGE,
                });

                const nextNotifications =
                    normalizeNotificationsResponse(response);

                setNotifications(nextNotifications);
                setTotal(Number(response?.total || response?.count || 0));
                setPage(Number(response?.page || nextPage));
            } catch (requestError) {
                setError(
                    requestError.response?.data?.message ||
                        requestError.response?.data?.error ||
                        requestError.message ||
                        t("notifications.loadFailed"),
                );
            } finally {
                if (withLoader) {
                    setIsLoading(false);
                }
            }
        },
        [page, t],
    );

    function handlePageChange(_, nextPage) {
        loadNotifications({
            nextPage,
            withLoader: true,
        });
    }

    function handleRefresh() {
        loadNotifications({
            nextPage: page,
            withLoader: true,
        });
    }

    function handleOpenDetails(notification) {
        onOpenNotificationDetails(notification);
    }

    useEffect(() => {
        if (!open) {
            return;
        }

        loadNotifications({
            nextPage: page,
            withLoader: true,
        });
    }, [open, page, refreshKey, loadNotifications, t]);

    return (
        <Drawer
            anchor='right'
            open={open}
            onClose={onClose}
            sx={{ zIndex: (theme) => theme.zIndex.drawer + 2 }}
            slotProps={{
                paper: {
                    sx: {
                        width: {
                            xs: '100%',
                            sm: 460,
                        },
                        maxWidth: '100%',
                        bgcolor: 'background.default',
                    },
                },
            }}
        >
            <Box
                sx={{
                    p: 3,
                    bgcolor: 'background.paper',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1,
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: 22,
                            fontWeight: 600,
                            color: 'text.primary',
                        }}
                    >
                        {t("notifications.all")}
                    </Typography>

                    <Stack direction='row' spacing={0.5}>
                        <IconButton
                            onClick={handleRefresh}
                            disabled={isLoading}
                            aria-label={t("notifications.refresh")}
                        >
                            <RefreshRoundedIcon />
                        </IconButton>

                        <IconButton
                            onClick={onClose}
                            aria-label={t("common.actions.close")}
                        >
                            <CloseRoundedIcon />
                        </IconButton>
                    </Stack>
                </Box>

                <Typography
                    sx={{ mt: 0.5, fontSize: 13, color: 'text.secondary' }}
                >
                    {t("notifications.subtitle")}
                </Typography>
            </Box>

            <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                {error ? (
                    <Alert severity='error' sx={{ m: 2 }}>
                        {error}
                    </Alert>
                ) : isLoading || !notifications.length ? (
                    <NotificationState loading={isLoading} />
                ) : (
                    <Box sx={{ p: 2, display: 'grid', gap: 1.5 }}>
                        {notifications.map((notification, index) => (
                            <NotificationItem
                                key={
                                    getNotificationId(notification) ||
                                    `${page}-${index}`
                                }
                                notification={notification}
                                onOpen={handleOpenDetails}
                            />
                        ))}
                    </Box>
                )}
            </Box>

            {pageCount > 1 && (
                <Box
                    sx={{
                        p: 2,
                        bgcolor: 'background.paper',
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <Pagination
                        page={page}
                        count={pageCount}
                        disabled={isLoading}
                        onChange={handlePageChange}
                        color='primary'
                        shape='rounded'
                        siblingCount={0}
                    />
                </Box>
            )}
        </Drawer>
    );
}

NotificationsColumn.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    onOpenNotificationDetails: PropTypes.func.isRequired,
    refreshKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

import PropTypes from 'prop-types';
import {
    alpha,
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Skeleton,
    Typography,
} from '@mui/material';
import { useTranslation } from "react-i18next";
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import {
    formatNotificationDate,
    getNotificationCreatedAt,
    getNotificationDescription,
    getNotificationLink,
    getNotificationTitle,
    resolveCustomerNotificationAppPath,
} from '../model/notifications.helpers';
import { useNavigate } from 'react-router-dom';
import { DialogCloseButton } from '../../../shared/ui/DialogCloseButton';
import { NotificationIcon } from './NotificationIcon';

export function NotificationDetailsModal({
    open,
    notification,
    loading,
    error,
    onClose,
}) {
    const { t } = useTranslation();

    const navigate = useNavigate();

    function handleOpenNotificationLink() {
        const link = getNotificationLink(notification);

        if (!link) {
            return;
        }

        try {
            const normalizedLink = String(link).replaceAll('\\/', '/');
            const url = new URL(normalizedLink, window.location.origin);

            const appPath = resolveCustomerNotificationAppPath(url.pathname);

            if (appPath) {
                onClose?.();
                navigate(`${appPath}${url.search}${url.hash}`);
                return;
            }

            window.open(normalizedLink, '_blank', 'noopener,noreferrer');
        } catch {
            window.open(link, '_blank', 'noopener,noreferrer');
        }
    }

    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onClose}
            fullWidth
            maxWidth='sm'
            aria-labelledby='notification-dialog-title'
            slotProps={{
                paper: {
                    sx: {
                        m: 2,
                        width: 'calc(100% - 32px)',
                        maxHeight: 'calc(100dvh - 32px)',
                    },
                },
            }}
        >
            <DialogTitle
                id='notification-dialog-title'
                sx={{
                    p: 3,
                    pr: 7,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    color: 'text.primary',
                    fontSize: 20,
                    fontWeight: 600,
                    overflowWrap: 'anywhere',
                }}
            >
                {notification
                    ? getNotificationTitle(notification)
                    : t("common.severity.notice")}
            </DialogTitle>

            <DialogCloseButton onClick={onClose} disabled={loading} />

            <DialogContent
                sx={{ p: 3, '&.MuiDialogContent-root': { pt: 3 } }}
            >
                {loading ? (
                    <Box sx={{ display: 'grid', gap: 1.5 }}>
                        <Skeleton variant='rounded' height={42} width={220} />

                        <Skeleton
                            variant='rounded'
                            height={120}
                            sx={(theme) => ({
                                borderRadius: `${theme.radius.md}px`,
                            })}
                        />
                    </Box>
                ) : error ? (
                    <Alert severity='error'>{error}</Alert>
                ) : (
                    notification && (
                        <>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    mb: 2,
                                }}
                            >
                                <Box
                                    sx={(theme) => ({
                                        width: 42,
                                        height: 42,
                                        borderRadius: `${theme.radius.md}px`,
                                        bgcolor: alpha(
                                            theme.palette.primary.main,
                                            0.08,
                                        ),
                                        color: 'primary.main',
                                        display: 'grid',
                                        placeItems: 'center',
                                        flexShrink: 0,
                                    })}
                                >
                                    <NotificationIcon
                                        notification={notification}
                                    />
                                </Box>

                                <Box
                                    sx={{
                                        color: 'text.primary',
                                        fontSize: 14,
                                        fontWeight: 600,
                                    }}
                                >
                                    {formatNotificationDate(
                                        getNotificationCreatedAt(notification),
                                    )}
                                </Box>
                            </Box>

                            <Typography
                                sx={(theme) => ({
                                    p: 2,
                                    borderRadius: `${theme.radius.md}px`,
                                    bgcolor: 'background.default',
                                    fontSize: 14,
                                    lineHeight: 1.8,
                                    color: 'text.secondary',
                                    whiteSpace: 'pre-wrap',
                                    overflowWrap: 'anywhere',
                                })}
                            >
                                {getNotificationDescription(notification)}
                            </Typography>
                        </>
                    )
                )}
            </DialogContent>

            <DialogActions
                sx={{
                    px: 3,
                    py: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    gap: 1,
                }}
            >
                <Button onClick={onClose} disabled={loading}>
                    {t("common.actions.close")}
                </Button>

                {!loading &&
                    !error &&
                    notification &&
                    getNotificationLink(notification) && (
                        <Button
                            variant='contained'
                            disableElevation
                            endIcon={<ArrowForwardRoundedIcon />}
                            onClick={handleOpenNotificationLink}
                        >
                            {t("common.actions.goTo")}
                        </Button>
                    )}
            </DialogActions>
        </Dialog>
    );
}

NotificationDetailsModal.propTypes = {
    open: PropTypes.bool,
    notification: PropTypes.object,
    loading: PropTypes.bool,
    error: PropTypes.string,
    onClose: PropTypes.func.isRequired,
};

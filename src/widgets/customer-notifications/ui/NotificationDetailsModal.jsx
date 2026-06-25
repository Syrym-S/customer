import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from '@mui/material';
import { formatNotificationDate, getNotificationCreatedAt, getNotificationDescription, getNotificationLink, getNotificationTitle, getNotificationType } from '../model/notifications.helpers';

export function NotificationDetailsModal({
    open,
    notification,
    loading,
    error,
    onClose,
}) {
    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onClose}
            fullWidth
            maxWidth='sm'
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 4,
                    },
                },
            }}
        >
            <DialogTitle sx={{ px: 3, pt: 3, pb: 1.5 }}>
                <Typography
                    sx={{
                        fontSize: {
                            xs: '18px',
                            sm: '20px',
                        },
                        fontWeight: 600,
                        lineHeight: 1.3,
                    }}
                >
                    {notification
                        ? getNotificationTitle(notification)
                        : 'Уведомление'}
                </Typography>

                {notification && (
                    <Typography
                        variant='body2'
                        color='text.secondary'
                        sx={{ mt: 0.5 }}
                    >
                        {formatNotificationDate(
                            getNotificationCreatedAt(notification),
                        )}
                    </Typography>
                )}
            </DialogTitle>

            <DialogContent sx={{ px: 3 }}>
                {loading && (
                    <Box
                        sx={{
                            minHeight: 160,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <CircularProgress />
                    </Box>
                )}

                {error && (
                    <Alert severity='error' sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {!loading && notification && (
                <Box
                    sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 3,
                        backgroundColor: 'background.paper',
                    }}
                >
                    <Typography
                        color='text.secondary'
                        sx={{
                            fontSize: 14,
                            lineHeight: 1.5,
                        }}
                    >
                        {getNotificationDescription(notification)}
                    </Typography>

                    <Box
                        sx={{
                            display: 'flex',
                            gap: 1,
                            flexWrap: 'wrap',
                            mt: 2,
                        }}
                    >
                        {getNotificationType(notification) && (
                            <Chip
                                size='small'
                                label={getNotificationType(notification)}
                                sx={{
                                    borderRadius: 999,
                                }}
                            />
                        )}

                        {notification.queue && (
                            <Chip
                                size='small'
                                label={`Очередь: ${notification.queue}`}
                                variant='outlined'
                                sx={{
                                    borderRadius: 999,
                                }}
                            />
                        )}
                    </Box>

                    {getNotificationLink(notification) && (
                        <Button
                            variant='outlined'
                            sx={{ mt: 2 }}
                            onClick={() => {
                                window.open(
                                    getNotificationLink(notification),
                                    '_blank',
                                    'noopener,noreferrer',
                                );
                            }}
                        >
                            Открыть связанный объект
                        </Button>
                    )}
                </Box>
            )}
            </DialogContent>

            <DialogActions
                sx={{
                    px: 3,
                    pb: 3,
                    pt: 2,
                    justifyContent: 'flex-end',
                }}
            >
                <Button onClick={onClose} disabled={loading}>
                    Закрыть
                </Button>
            </DialogActions>
        </Dialog>
    );
}
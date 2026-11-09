import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import { alpha, Box, ButtonBase, Typography } from '@mui/material';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

import {
    formatNotificationDate,
    getNotificationCreatedAt,
    getNotificationDescription,
    getNotificationTitle,
    isNotificationUnread,
} from '../model/notifications.helpers';
import { NotificationIcon } from './NotificationIcon';

// One card shared by the dropdown preview and the drawer, so the two lists
// cannot drift apart. Colours and radii come from the app theme (including
// its own `radius` scale) rather than hardcoded values, so the block stays
// inside the existing design system.
export function NotificationItem({ notification, onOpen }) {
    const { t } = useTranslation();

    const isUnread = isNotificationUnread(notification);

    return (
        <ButtonBase
            onClick={() => onOpen(notification)}
            sx={(theme) => ({
                width: '100%',
                textAlign: 'left',
                alignItems: 'flex-start',
                gap: 1.5,
                p: 2,
                borderRadius: `${theme.radius.lg}px`,
                border: '1px solid',
                borderColor: isUnread ? 'primary.main' : 'divider',
                bgcolor: isUnread
                    ? alpha(theme.palette.primary.main, 0.06)
                    : 'background.paper',
                transition: 'background-color 150ms',

                '&:hover': {
                    bgcolor: alpha(theme.palette.divider, 0.32),
                },

                '&.Mui-focusVisible': {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: 2,
                },
            })}
        >
            <Box
                sx={(theme) => ({
                    display: 'grid',
                    placeItems: 'center',
                    width: 38,
                    height: 38,
                    flexShrink: 0,
                    borderRadius: `${theme.radius.sm}px`,
                    bgcolor: isUnread
                        ? 'background.paper'
                        : alpha(theme.palette.divider, 0.5),
                    color: 'primary.main',
                })}
            >
                <NotificationIcon notification={notification} />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                    component='span'
                    sx={{
                        display: 'block',
                        fontSize: 14,
                        fontWeight: isUnread ? 600 : 500,
                        color: 'text.primary',
                        overflowWrap: 'anywhere',
                    }}
                >
                    {getNotificationTitle(notification)}
                </Typography>

                <Typography
                    component='span'
                    sx={{
                        mt: 0.5,
                        fontSize: 13,
                        lineHeight: 1.6,
                        color: 'text.secondary',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        overflowWrap: 'anywhere',
                    }}
                >
                    {getNotificationDescription(notification)}
                </Typography>

                <Box
                    sx={{
                        mt: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        flexWrap: 'wrap',
                    }}
                >
                    {isUnread && (
                        <Typography
                            component='span'
                            sx={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: 'primary.main',
                            }}
                        >
                            {t('notifications.isNew')}
                        </Typography>
                    )}

                    <Typography
                        component='span'
                        sx={{ fontSize: 11, color: 'text.secondary' }}
                    >
                        {formatNotificationDate(
                            getNotificationCreatedAt(notification),
                        )}
                    </Typography>
                </Box>
            </Box>

            <ChevronRightRoundedIcon
                sx={{
                    mt: 1,
                    fontSize: 18,
                    color: 'text.secondary',
                    flexShrink: 0,
                }}
            />
        </ButtonBase>
    );
}

NotificationItem.propTypes = {
    notification: PropTypes.object.isRequired,
    onOpen: PropTypes.func.isRequired,
};

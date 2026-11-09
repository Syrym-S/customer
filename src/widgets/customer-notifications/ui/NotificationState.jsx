import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import { alpha, Box, Skeleton, Typography } from '@mui/material';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';

// Placeholder shown while the list loads and when it comes back empty.
export function NotificationState({ loading = false }) {
    const { t } = useTranslation();

    if (loading) {
        return (
            <Box
                role='status'
                aria-label={t('notifications.loading')}
                sx={{ p: 2, display: 'grid', gap: 1.5 }}
            >
                {[0, 1, 2].map((item) => (
                    <Skeleton
                        key={item}
                        variant='rounded'
                        height={100}
                        sx={(theme) => ({
                            borderRadius: `${theme.radius.lg}px`,
                        })}
                    />
                ))}
            </Box>
        );
    }

    return (
        <Box sx={{ px: 3, py: 6, textAlign: 'center' }}>
            <Box
                sx={(theme) => ({
                    mx: 'auto',
                    mb: 2,
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: 'primary.main',
                    display: 'grid',
                    placeItems: 'center',
                })}
            >
                <NotificationsNoneOutlinedIcon sx={{ fontSize: 30 }} />
            </Box>

            <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                {t('notifications.empty')}
            </Typography>

            <Typography
                sx={{
                    mt: 1,
                    fontSize: 13,
                    color: 'text.secondary',
                    lineHeight: 1.6,
                }}
            >
                {t('notifications.emptyHint')}
            </Typography>
        </Box>
    );
}

NotificationState.propTypes = {
    loading: PropTypes.bool,
};

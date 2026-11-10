import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Avatar, Box, Skeleton, Stack, Typography } from '@mui/material';

import { CopyableContact } from '../../../../shared/ui/CopyableContact';
import { ForwarderDataGroup } from './ForwarderDataGroup';
import {
    getForwarderAccount,
    getForwarderAddress,
    getForwarderAvatarUrl,
    getForwarderBik,
    getForwarderBin,
    getForwarderCompanyName,
    getForwarderEmail,
    getForwarderFio,
    getForwarderIin,
    getForwarderInitials,
    getForwarderPhone,
} from '../../model/forwarders.helpers';

function ForwarderInfoHeader({ forwarder }) {
    const avatarUrl = getForwarderAvatarUrl(forwarder);

    return (
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
            <Avatar
                src={avatarUrl || undefined}
                sx={{
                    width: 56,
                    height: 56,
                    fontSize: 20,
                    fontWeight: 700,
                    bgcolor: 'primary.main',
                    color: 'common.white',
                    flexShrink: 0,
                }}
            >
                {getForwarderInitials(forwarder)}
            </Avatar>

            <Box sx={{ minWidth: 0 }}>
                <Typography
                    title={getForwarderCompanyName(forwarder)}
                    sx={{
                        fontSize: 16,
                        fontWeight: 600,
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {getForwarderCompanyName(forwarder)}
                </Typography>

                <Typography
                    title={getForwarderFio(forwarder)}
                    sx={{
                        mt: 0.25,
                        fontSize: 13,
                        color: 'text.secondary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {getForwarderFio(forwarder)}
                </Typography>
            </Box>
        </Stack>
    );
}

ForwarderInfoHeader.propTypes = {
    forwarder: PropTypes.object,
};

function ForwarderInfoSkeleton() {
    const { t } = useTranslation();

    return (
        <Stack spacing={2} role="status" aria-label={t('common.loading.default')}>
            <Stack direction="row" spacing={1.5} alignItems="center">
                <Skeleton variant="circular" width={56} height={56} />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Skeleton variant="text" width="80%" sx={{ fontSize: 16 }} />

                    <Skeleton variant="text" width="55%" sx={{ fontSize: 13 }} />
                </Box>
            </Stack>

            <Skeleton
                variant="rounded"
                height={190}
                sx={(theme) => ({ borderRadius: `${theme.radius.md}px` })}
            />

            <Skeleton
                variant="rounded"
                height={160}
                sx={(theme) => ({ borderRadius: `${theme.radius.md}px` })}
            />
        </Stack>
    );
}

export function ForwarderInfoColumn({ forwarder, loading }) {
    const { t } = useTranslation();

    if (loading || !forwarder) {
        return <ForwarderInfoSkeleton />;
    }

    const legalRows = [
        {
            label: t('common.fields.companyName'),
            value: getForwarderCompanyName(forwarder),
        },
        {
            label: t('common.fields.bin'),
            value: getForwarderBin(forwarder),
        },
        {
            label: t('common.fields.bik'),
            value: getForwarderBik(forwarder),
        },
        {
            label: t('common.fields.settlementAccount'),
            value: getForwarderAccount(forwarder),
        },
        {
            label: t('common.fields.companyAddress'),
            value: getForwarderAddress(forwarder),
        },
    ];

    const individualRows = [
        {
            label: t('common.fields.fullName'),
            value: getForwarderFio(forwarder),
        },
        {
            label: t('common.fields.iin'),
            value: getForwarderIin(forwarder),
        },
        {
            label: t('common.fields.phone'),
            value: <CopyableContact type="phone" value={getForwarderPhone(forwarder)} />,
        },
        {
            label: t('common.fields.email'),
            value: <CopyableContact type="email" value={getForwarderEmail(forwarder)} />,
        },
    ];

    return (
        <Stack spacing={2}>
            <ForwarderInfoHeader forwarder={forwarder} />

            <ForwarderDataGroup
                title={t('forwarders.sections.legalEntity')}
                rows={legalRows}
            />

            <ForwarderDataGroup
                title={t('forwarders.sections.individual')}
                rows={individualRows}
            />
        </Stack>
    );
}

ForwarderInfoColumn.propTypes = {
    forwarder: PropTypes.object,
    loading: PropTypes.bool,
};

import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Pagination, Skeleton, Stack, Typography } from '@mui/material';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';

import { ForwarderLeadCard } from './ForwarderLeadCard';
import { FORWARDER_LEADS_PER_PAGE } from '../../model/forwarder-leads.helpers';

function ForwarderLeadsSkeleton() {
    const { t } = useTranslation();

    return (
        <Stack spacing={1.5} role="status" aria-label={t('common.loading.list')}>
            {Array.from({ length: FORWARDER_LEADS_PER_PAGE }, (_, index) => (
                <Skeleton
                    key={index}
                    variant="rounded"
                    height={132}
                    sx={(theme) => ({ borderRadius: `${theme.radius.md}px` })}
                />
            ))}
        </Stack>
    );
}

function ForwarderLeadsEmptyState() {
    const { t } = useTranslation();

    return (
        <Stack
            spacing={1}
            alignItems="center"
            justifyContent="center"
            sx={{
                py: 6,
                px: 2,
                textAlign: 'center',
                color: 'text.secondary',
            }}
        >
            <InboxOutlinedIcon sx={{ fontSize: 40, color: 'action.disabled' }} />

            <Typography sx={{ fontSize: 14 }}>
                {t('forwarders.leads.empty')}
            </Typography>
        </Stack>
    );
}

export function ForwarderLeadsColumn({
    leads,
    page,
    pageCount,
    loading,
    error,
    onPageChange,
    onOpenLead,
}) {
    const { t } = useTranslation();

    return (
        <Stack
            spacing={2}
            sx={{
                height: '100%',
                minHeight: 0,
            }}
        >
            <Typography sx={{ fontSize: 15, fontWeight: 600 }}>
                {t('forwarders.leads.title')}
            </Typography>

            <Box
                sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    pr: {
                        xs: 0,
                        md: 0.5,
                    },
                }}
            >
                {error && (
                    <Alert severity="error" sx={{ mb: 1.5 }}>
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <ForwarderLeadsSkeleton />
                ) : leads.length === 0 ? (
                    !error && <ForwarderLeadsEmptyState />
                ) : (
                    <Stack spacing={1.5}>
                        {leads.map((lead) => (
                            <ForwarderLeadCard
                                key={lead.id}
                                lead={lead}
                                onOpen={onOpenLead}
                            />
                        ))}
                    </Stack>
                )}
            </Box>

            {!loading && pageCount > 1 && (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    <Pagination
                        page={page}
                        count={pageCount}
                        onChange={onPageChange}
                        color="primary"
                        shape="rounded"
                        size="small"
                    />
                </Box>
            )}
        </Stack>
    );
}

ForwarderLeadsColumn.propTypes = {
    leads: PropTypes.array.isRequired,
    page: PropTypes.number.isRequired,
    pageCount: PropTypes.number.isRequired,
    loading: PropTypes.bool,
    error: PropTypes.string,
    onPageChange: PropTypes.func.isRequired,
    onOpenLead: PropTypes.func.isRequired,
};

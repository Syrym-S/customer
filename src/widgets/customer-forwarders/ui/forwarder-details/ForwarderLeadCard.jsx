import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Box, Stack, Typography } from '@mui/material';

import { StatusDot } from '../../../../shared/ui/StatusDot';
import { CardRouteLine } from '../../../../shared/ui/CardRouteLine';
import {
    getDisplayLeadStatusLabel,
    getDisplayLeadStatusStyles,
} from '../../../customer-leads/model/lead.helpers';
import {
    getForwarderLeadCargoLabel,
    getForwarderLeadDates,
    getForwarderLeadRoute,
} from '../../model/forwarder-leads.helpers';

function LeadMetaItem({ label, value }) {
    return (
        <Box sx={{ minWidth: 0 }}>
            <Typography
                sx={{
                    fontSize: 11,
                    lineHeight: 1.2,
                    color: 'text.secondary',
                    mb: 0.25,
                }}
            >
                {label}
            </Typography>

            <Typography
                title={String(value)}
                sx={{
                    fontSize: 13,
                    fontWeight: 500,
                    lineHeight: 1.35,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}
            >
                {value}
            </Typography>
        </Box>
    );
}

LeadMetaItem.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.node,
};

export function ForwarderLeadCard({ lead, onOpen }) {
    const { t } = useTranslation();

    const route = getForwarderLeadRoute(lead);
    const dates = getForwarderLeadDates(lead);
    const cargoLabel = getForwarderLeadCargoLabel(lead);

    function handleKeyDown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onOpen(lead);
        }
    }

    return (
        <Box
            onClick={() => onOpen(lead)}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            sx={{
                p: {
                    xs: 1.5,
                    sm: 2,
                },
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                backgroundColor: 'background.paper',
                cursor: 'pointer',
                transition: '0.2s ease',
                '&:hover': {
                    borderColor: 'primary.light',
                    boxShadow: '0 8px 24px rgba(33, 150, 243, 0.12)',
                },
                '&:focus-visible': {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: 2,
                },
            }}
        >
            <Stack spacing={1.5}>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    justifyContent="space-between"
                >
                    <CardRouteLine
                        fromLabel={route.fromLabel}
                        fromTitle={route.fromTitle}
                        toLabel={route.toLabel}
                        toTitle={route.toTitle}
                        fontWeight={600}
                    />

                    <Stack
                        direction="row"
                        spacing={0.75}
                        alignItems="center"
                        sx={{ flexShrink: 0 }}
                    >
                        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                            #{lead.num || '—'}
                        </Typography>

                        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                            ·
                        </Typography>

                        <StatusDot
                            label={getDisplayLeadStatusLabel(lead)}
                            color={getDisplayLeadStatusStyles(lead).color}
                        />
                    </Stack>
                </Stack>

                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: 'repeat(2, minmax(0, 1fr))',
                            sm: 'repeat(3, minmax(0, 1fr))',
                        },
                        gap: 1,
                    }}
                >
                    <LeadMetaItem
                        label={t('common.fields.createdAt')}
                        value={dates.createdAtLabel}
                    />

                    <LeadMetaItem
                        label={t('common.fields.startDate')}
                        value={dates.startAtLabel}
                    />

                    <LeadMetaItem
                        label={t('common.fields.endDate')}
                        value={dates.endAtLabel}
                    />
                </Box>

                <LeadMetaItem label={t('common.fields.cargo')} value={cargoLabel} />
            </Stack>
        </Box>
    );
}

ForwarderLeadCard.propTypes = {
    lead: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        num: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        status: PropTypes.string,
        is_draft: PropTypes.bool,
        created_at: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        from_location: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        to_location: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        waypoints: PropTypes.array,
        point_schedules: PropTypes.array,
        cargos: PropTypes.array,
    }).isRequired,
    onOpen: PropTypes.func.isRequired,
};

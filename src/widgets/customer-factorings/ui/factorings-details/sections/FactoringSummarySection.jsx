import { Box, Chip } from '@mui/material';
import { DetailSection } from '../components/DetailSection';
import { InfoBadge } from '../components/InfoBadge';

import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import {
    formatDate,
    getFactoringStatusColor,
    getFactoringStatusLabel,
} from '../../../model/factorings.helpers';

export function FactoringSummarySection({ factoring }) {
    return (
        <DetailSection
            icon={<AssignmentOutlinedIcon />}
            title='Основная информация'
            subtitle='Номер заявки, дата создания и связанный лид'
        >
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(4, 1fr)',
                    },
                    gap: 1,
                }}
            >
                <InfoBadge label='Номер' value={factoring.index} />

                <InfoBadge
                    label='Дата создания'
                    value={formatDate(factoring.created_at)}
                />

                <InfoBadge
                    label='Lead ID'
                    value={factoring.lead_id || '—'}
                    fullWidth
                />

                <InfoBadge
                    label='Статус'
                    value={
                        <Chip
                            size='small'
                            label={getFactoringStatusLabel(factoring.status)}
                            color={getFactoringStatusColor(factoring.status)}
                            sx={{ borderRadius: 999 }}
                        />
                    }
                />
            </Box>
        </DetailSection>
    );
}

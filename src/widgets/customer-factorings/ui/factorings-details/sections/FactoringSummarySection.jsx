import { Box } from '@mui/material';
import { DetailSection } from '../components/DetailSection';
import { InfoBadge } from '../components/InfoBadge';

import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import {
    formatDate,
    getFactoringStatusColor,
    getFactoringStatusLabel,
} from '../../../model/factorings.helpers';
import { paletteKeyToColorPath } from '../../../../../shared/helpers/status-color.helpers';
import { StatusDot } from '../../../../../shared/ui/StatusDot';

export function FactoringSummarySection({ factoring }) {
    return (
        <DetailSection
            icon={<AssignmentOutlinedIcon />}
            title="Основная информация"
            subtitle="Номер заявки, дата создания и связанный лид"
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
                <InfoBadge label="Номер" value={factoring.id} />

                <InfoBadge
                    label="Дата создания"
                    value={formatDate(factoring.created_at)}
                />

                <InfoBadge
                    label="Lead ID"
                    value={factoring.lead_id || '—'}
                    fullWidth
                />

                <InfoBadge
                    label="Статус"
                    value={
                        <StatusDot
                            label={getFactoringStatusLabel(factoring.status)}
                            color={paletteKeyToColorPath(getFactoringStatusColor(factoring.status))}
                        />
                    }
                />
            </Box>
        </DetailSection>
    );
}

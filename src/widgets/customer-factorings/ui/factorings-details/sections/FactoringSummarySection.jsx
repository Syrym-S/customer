import { Box } from '@mui/material';
import { useTranslation } from "react-i18next";
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
    const { t } = useTranslation();

    return (
        <DetailSection
            icon={<AssignmentOutlinedIcon />}
            title={t("factorings.details.main")}
            subtitle={t("factorings.details.mainSubtitle")}
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
                <InfoBadge label={t("common.fields.number")} value={factoring.id} />

                <InfoBadge
                    label={t("factorings.details.createdAt")}
                    value={formatDate(factoring.created_at)}
                />

                <InfoBadge
                    label="Lead ID"
                    value={factoring.lead_id || '—'}
                    fullWidth
                />

                <InfoBadge
                    label={t("common.fields.status")}
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

import { Box, Stack, Typography } from '@mui/material';
import i18n from '../../../../../shared/i18n';
import { useTranslation } from "react-i18next";
import PropTypes from 'prop-types';

import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';

import { DetailSection } from '../components/DetailSection';
import { InfoBadge } from '../components/InfoBadge';
import { formatAmount } from '../../../../../shared/helpers/currency-format.helpers';
import {
    formatCargoVolumeM3,
    getCompositionTypeLabel,
    getLoadingTypeLabel,
    getPackagingTypeLabel,
    getTransportTypeLabel,
} from '../../../../customer-leads/model/lead-transportation.helpers';

function hasValue(value) {
    return value !== null && value !== undefined && value !== '';
}

function getCargoDimensionsDisplay(cargo) {
    const length = cargo.length_cm;
    const width = cargo.width_cm;
    const height = cargo.height_cm;

    if (!hasValue(length) && !hasValue(width) && !hasValue(height)) {
        return i18n.t("common.empty.notSpecifiedN");
    }

    return i18n.t('common.units.dimensionsCm', {
      length: length || '—',
      width: width || '—',
      height: height || '—',
   });
}

export function FactoringCargoSection({ factoring }) {
    const { t } = useTranslation();

    const lead = factoring?.lead || {};
    const cargos = Array.isArray(lead.cargos) ? lead.cargos : [];

    const loadingTypeLabel = getLoadingTypeLabel(lead.loadingType);
    const packagingTypeLabel = getPackagingTypeLabel(lead.packagingType);
    const compositionTypeLabel = getCompositionTypeLabel(lead.compositionType);
    const transportTypeLabel = getTransportTypeLabel(lead.transportType);

    return (
        <DetailSection
            icon={<LocalShippingOutlinedIcon />}
            title={t("factorings.details.cargoSection")}
        >
            <Stack spacing={1.5}>
                {cargos.length ? (
                    cargos.map((cargo, index) => (
                        <Box
                            key={cargo.id || index}
                            sx={{
                                p: 1.5,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                backgroundColor: 'grey.50',
                            }}
                        >
                            <Typography fontWeight={600} sx={{ mb: 1 }}>
                                {t("leads.cargo.itemNumber", { index: index + 1 })}
                            </Typography>

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
                                <InfoBadge
                                    label={t("common.fields.title")}
                                    value={cargo.name || t("common.empty.notSpecifiedN")}
                                />

                                <InfoBadge
                                    label={t("common.fields.type")}
                                    value={cargo.type || t("common.empty.notSpecifiedM")}
                                />

                                <InfoBadge
                                    label={t("common.fields.weight")}
                                    value={
                                        hasValue(cargo.weight_kg)
                                            ? t("common.units.kg", { value: cargo.weight_kg })
                                            : t("common.empty.notSpecifiedN")
                                    }
                                />

                                <InfoBadge
                                    label={t("common.fields.cargoPrice")}
                                    value={
                                        hasValue(cargo.cargo_price)
                                            ? `${formatAmount(cargo.cargo_price)} ${lead.currency || ''}`.trim()
                                            : t("common.empty.notSpecifiedN")
                                    }
                                />

                                <InfoBadge
                                    label={t("common.fields.dimensions")}
                                    value={getCargoDimensionsDisplay(cargo)}
                                />

                                <InfoBadge
                                    label={t("common.fields.volume")}
                                    value={
                                        formatCargoVolumeM3(cargo.volume_m3) ||
                                        t("common.empty.notSpecifiedN")
                                    }
                                />

                                {cargo.tnved?.code && (
                                    <InfoBadge
                                        label={t("common.fields.tnvedCode")}
                                        value={`${cargo.tnved.code} — ${cargo.tnved.name}`}
                                    />
                                )}
                            </Box>
                        </Box>
                    ))
                ) : (
                    <InfoBadge label={t("common.fields.cargo")} value={t("common.empty.notSpecifiedM")} fullWidth />
                )}

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
                    {loadingTypeLabel && (
                        <InfoBadge
                            label={t("common.fields.loadingType")}
                            value={loadingTypeLabel}
                        />
                    )}

                    {packagingTypeLabel && (
                        <InfoBadge
                            label={t("common.fields.packagingType")}
                            value={packagingTypeLabel}
                        />
                    )}

                    {compositionTypeLabel && (
                        <InfoBadge
                            label={t("common.fields.bodyType")}
                            value={compositionTypeLabel}
                        />
                    )}

                    {transportTypeLabel && (
                        <InfoBadge
                            label={t("common.fields.transportType")}
                            value={transportTypeLabel}
                        />
                    )}
                </Box>
            </Stack>
        </DetailSection>
    );
}

FactoringCargoSection.propTypes = {
    factoring: PropTypes.object,
};

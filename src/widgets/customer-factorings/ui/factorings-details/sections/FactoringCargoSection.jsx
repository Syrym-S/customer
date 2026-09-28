import { Box, Stack, Typography } from '@mui/material';
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
        return 'Не указано';
    }

    return `${length || '—'} × ${width || '—'} × ${height || '—'} см`;
}

export function FactoringCargoSection({ factoring }) {
    const lead = factoring?.lead || {};
    const cargos = Array.isArray(lead.cargos) ? lead.cargos : [];

    const loadingTypeLabel = getLoadingTypeLabel(lead.loadingType);
    const packagingTypeLabel = getPackagingTypeLabel(lead.packagingType);
    const compositionTypeLabel = getCompositionTypeLabel(lead.compositionType);
    const transportTypeLabel = getTransportTypeLabel(lead.transportType);

    return (
        <DetailSection
            icon={<LocalShippingOutlinedIcon />}
            title="Груз и параметры перевозки"
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
                                Груз #{index + 1}
                            </Typography>

                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: {
                                        xs: '1fr 1fr',
                                        sm: 'repeat(2, 1fr)',
                                        md: 'repeat(4, 1fr)',
                                    },
                                    gap: 1,
                                }}
                            >
                                <InfoBadge
                                    label="Наименование"
                                    value={cargo.name || 'Не указано'}
                                />

                                <InfoBadge
                                    label="Тип"
                                    value={cargo.type || 'Не указан'}
                                />

                                <InfoBadge
                                    label="Вес"
                                    value={
                                        hasValue(cargo.weight_kg)
                                            ? `${cargo.weight_kg} кг`
                                            : 'Не указано'
                                    }
                                />

                                <InfoBadge
                                    label="Цена груза"
                                    value={
                                        hasValue(cargo.cargo_price)
                                            ? `${formatAmount(cargo.cargo_price)} ${lead.currency || ''}`.trim()
                                            : 'Не указано'
                                    }
                                />

                                <InfoBadge
                                    label="Размеры"
                                    value={getCargoDimensionsDisplay(cargo)}
                                />

                                <InfoBadge
                                    label="Объем"
                                    value={
                                        formatCargoVolumeM3(cargo.volume_m3) ||
                                        'Не указано'
                                    }
                                />
                            </Box>
                        </Box>
                    ))
                ) : (
                    <InfoBadge label="Груз" value="Не указан" fullWidth />
                )}

                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr 1fr',
                            sm: 'repeat(2, 1fr)',
                            md: 'repeat(4, 1fr)',
                        },
                        gap: 1,
                    }}
                >
                    {loadingTypeLabel && (
                        <InfoBadge
                            label="Тип погрузки"
                            value={loadingTypeLabel}
                        />
                    )}

                    {packagingTypeLabel && (
                        <InfoBadge
                            label="Вид упаковки"
                            value={packagingTypeLabel}
                        />
                    )}

                    {compositionTypeLabel && (
                        <InfoBadge
                            label="Тип состава"
                            value={compositionTypeLabel}
                        />
                    )}

                    {transportTypeLabel && (
                        <InfoBadge
                            label="Тип транспорта"
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

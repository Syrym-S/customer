import { Box, Divider, Stack } from '@mui/material';
import i18n from '../../../../../shared/i18n';
import { useTranslation } from "react-i18next";
import PropTypes from 'prop-types';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import TripOriginIcon from '@mui/icons-material/TripOrigin';

import { InfoBadge } from '../components/InfoBadge';
import { StepSection } from '../components/StepSection';
import { formatAmount } from '../../../../../shared/helpers/currency-format.helpers';
import { RoutePoint } from '../../../../../widgets/customer-leads/ui/lead-details/components/RoutePoint';
import {
    formatScheduleDatePart,
    getWaypointTypeChipColor,
    getWaypointTypeLabel,
} from '../../../../../widgets/customer-leads/model/lead-route.helpers';
import {
    formatCargoVolumeM3,
    getCompositionTypeLabel,
    getLoadingTypeLabel,
    getPackagingTypeLabel,
    getTransportTypeLabel,
} from '../../../../../widgets/customer-leads/model/lead-transportation.helpers';

function getLocationDisplay(location, fallback) {
    if (location?.address) {
        return location.address;
    }

    return fallback || i18n.t("common.empty.notSpecifiedN");
}

function getFormCargos(form) {
    return Array.isArray(form.cargos) ? form.cargos : [];
}

function getFormWaypoints(form) {
    return Array.isArray(form.waypoints) ? form.waypoints : [];
}

function getFormPointDateLabel(startAt, endAt) {
    const startLabel = formatScheduleDatePart(startAt);
    const endLabel = formatScheduleDatePart(endAt);

    if (startLabel && endLabel && startLabel !== endLabel) {
        return `${startLabel} – ${endLabel}`;
    }

    return startLabel || endLabel || null;
}

function getDimensionsDisplay(cargo) {
    const length = cargo.length_cm;
    const width = cargo.width_cm;
    const height = cargo.height_cm;

    if (!length && !width && !height) {
        return i18n.t("common.empty.notSpecifiedN");
    }

    return i18n.t('common.units.dimensionsCm', {
      length: length || '—',
      width: width || '—',
      height: height || '—',
   });
}

export function ConfirmStep({ form }) {
    const { t } = useTranslation();

    const selectedForwarder = form.forwarder;
    const cargos = getFormCargos(form);
    const waypoints = getFormWaypoints(form);

    const loadingTypeLabel = getLoadingTypeLabel(form.loadingType);
    const packagingTypeLabel = getPackagingTypeLabel(form.packagingType);
    const compositionTypeLabel = getCompositionTypeLabel(form.compositionType);
    const transportTypeLabel = getTransportTypeLabel(form.transportType);

    return (
        <Box sx={{ display: 'grid', gap: 2 }}>
            <StepSection title={t("createLead.steps.route")}>
                <Stack spacing={1.25}>
                    <RoutePoint
                        label={t("common.fields.origin")}
                        value={getLocationDisplay(
                            form.from_location,
                            form.fromLocation,
                        )}
                        icon={<TripOriginIcon />}
                        date={getFormPointDateLabel(
                            form.fromStartAt,
                            form.fromEndAt,
                        )}
                    />

                    {waypoints.map((waypoint, index) => (
                        <RoutePoint
                            key={waypoint.id || index}
                            label={t("route.waypointHash", { index: index + 1 })}
                            value={waypoint.location || t("common.empty.notSpecifiedN")}
                            icon={<LocationOnOutlinedIcon />}
                            typeLabel={getWaypointTypeLabel(waypoint.type)}
                            typeColor={getWaypointTypeChipColor(waypoint.type)}
                            date={getFormPointDateLabel(
                                waypoint.startAt,
                                waypoint.endAt,
                            )}
                        />
                    ))}

                    <RoutePoint
                        label={t("common.fields.destination")}
                        value={getLocationDisplay(
                            form.to_location,
                            form.toLocation,
                        )}
                        icon={<LocationOnOutlinedIcon />}
                        date={getFormPointDateLabel(
                            form.toStartAt,
                            form.toEndAt,
                        )}
                    />
                </Stack>

                {form.is_international && (
                    <Box sx={{ mt: 1.25 }}>
                        <InfoBadge
                            label={t("common.fields.international")}
                            value={t("common.actions.yes")}
                        />
                    </Box>
                )}
            </StepSection>

            <StepSection title={t("createLead.steps.confirmTitle")}>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: '1fr 1fr',
                        },
                        gap: 1,
                    }}
                >
                    <Box
                        sx={{
                            gridColumn: {
                                xs: 'auto',
                                sm: '1 / -1',
                            },
                            display: 'grid',
                            gap: 1,
                        }}
                    >
                        {cargos.map((cargo, index) => (
                            <Box key={`${cargo.name || cargo.type || 'cargo'}-${index}`}>
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: {
                                            xs: '1fr',
                                            sm: 'repeat(2, 1fr)',
                                        },
                                        gap: 1,
                                    }}
                                >
                                    <InfoBadge
                                        label={t("leads.cargo.itemNumber", { index: index + 1 })}
                                        value={cargo.name || t("common.empty.notSpecifiedN")}
                                    />

                                    <InfoBadge
                                        label={t("common.fields.cargoType")}
                                        value={cargo.type || t("common.empty.notSpecifiedM")}
                                    />

                                    <InfoBadge
                                        label={t("common.fields.weight")}
                                        value={
                                            cargo.weight_kg
                                                ? t("common.units.kg", { value: cargo.weight_kg })
                                                : t("common.empty.notSpecifiedN")
                                        }
                                    />

                                    <InfoBadge
                                        label={t("common.fields.cargoPrice")}
                                        value={
                                            cargo.cargo_price
                                                ? `${formatAmount(cargo.cargo_price)} ${form.currency || ''}`.trim()
                                                : t("common.empty.notSpecifiedN")
                                        }
                                    />

                                    <InfoBadge
                                        label={t("common.fields.dimensions")}
                                        value={getDimensionsDisplay(cargo)}
                                    />

                                    <InfoBadge
                                        label={t("common.fields.volume")}
                                        value={
                                            formatCargoVolumeM3(
                                                cargo.volume_m3,
                                            ) || t("common.empty.notSpecifiedN")
                                        }
                                    />

                                    {cargo.tnved?.code && (
                                        <InfoBadge
                                            label={t("common.fields.tnvedCode")}
                                            value={`${cargo.tnved.code} — ${cargo.tnved.name}`}
                                        />
                                    )}
                                </Box>

                                {index < cargos.length - 1 && (
                                    <Divider sx={{ my: 1.5 }} />
                                )}
                            </Box>
                        ))}
                    </Box>

                    <InfoBadge
                        label={t("common.fields.executionPrice")}
                        value={
                            form.price
                                ? `${formatAmount(form.price)} ${form.currency || ''}`.trim()
                                : t("common.empty.notSpecifiedN")
                        }
                        accent
                    />

                    <InfoBadge
                        label={t("common.fields.gracePeriod")}
                        value={
                            form.gracePeriodDays
                                ? t("common.units.days", { count: form.gracePeriodDays })
                                : t("common.empty.notSpecifiedN")
                        }
                    />
                </Box>
            </StepSection>

            <StepSection title={t("common.fields.transportParams")}>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, 1fr)',
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
            </StepSection>

            <StepSection title={t("common.fields.forwarder")}>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, 1fr)',
                        },
                        gap: 1.5,
                    }}
                >
                    <InfoBadge
                        label={t("common.fields.forwarderFullName")}
                        value={selectedForwarder?.fullName || t("common.empty.notSelected")}
                    />
                    <InfoBadge
                        label={t("common.fields.forwarderIin")}
                        value={selectedForwarder?.iin || '—'}
                    />
                    <InfoBadge
                        label={t("common.fields.company")}
                        value={selectedForwarder?.companyName || '—'}
                    />
                    <InfoBadge
                        label={t("common.fields.companyBin")}
                        value={selectedForwarder?.companyBin || '—'}
                    />
                    <InfoBadge
                        label={t("common.fields.phone")}
                        value={selectedForwarder?.phone || '—'}
                    />
                </Box>
            </StepSection>

            <StepSection title={t("createLead.steps.documents")}>
                {form.documents?.length ? (
                    <Box
                        sx={{
                            display: 'grid',
                            gap: 1,
                        }}
                    >
                        {form.documents.map((document) => (
                            <InfoBadge
                                key={document.id}
                                label={document.name || t("common.fields.document")}
                                value={document.fileName || t("common.fields.file")}
                            />
                        ))}
                    </Box>
                ) : (
                    <InfoBadge label={t("createLead.steps.documents")} value={t("common.empty.notAdded")} />
                )}
            </StepSection>
        </Box>
    );
}

ConfirmStep.propTypes = {
    form: PropTypes.object.isRequired,
};

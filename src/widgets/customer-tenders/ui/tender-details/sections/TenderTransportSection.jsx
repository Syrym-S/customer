import { Box, Stack, Typography } from '@mui/material';
import { useTranslation } from "react-i18next";
import ArrowRightAltRoundedIcon from '@mui/icons-material/ArrowRightAltRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined';
import TripOriginIcon from '@mui/icons-material/TripOrigin';

import { TenderDetailsSection } from './TenderDetailsSection';
import { TenderInfoBadge } from './TenderInfoBadge';
import { RoutePoint } from '../../../../customer-leads/ui/lead-details/components/RoutePoint';

import { tenderPropType } from '../../../model/tenders.prop-types';
import { normalizeLocationValue } from '../../../model/tender-edit-form.helpers';
import {
   getTenderCargoPriceLabel,
   getTenderCargos,
   hasValue,
} from '../../../model/tender.helpers';
import {
   formatCargoVolumeM3,
   getCompositionTypeLabel,
   getLoadingTypeLabel,
   getPackagingTypeLabel,
   getTransportTypeLabel,
} from '../../../../customer-leads/model/lead-transportation.helpers';
import {
   getPointScheduleByIndex,
   getPointScheduleLabel,
} from '../../../../customer-leads/model/lead-route.helpers';
import { formatAmount } from '../../../../../shared/helpers/currency-format.helpers';

export function TenderTransportSection({ tender }) {
   const { t } = useTranslation();

   const lead = tender.lead || {};
   const cargos = getTenderCargos(tender);

   const loadingTypeLabel = getLoadingTypeLabel(lead.loadingType);
   const packagingTypeLabel = getPackagingTypeLabel(lead.packagingType);
   const compositionTypeLabel = getCompositionTypeLabel(lead.compositionType);
   const transportTypeLabel = getTransportTypeLabel(lead.transportType);

   const fromLocation = tender.from_location || lead.from_location;
   const toLocation = tender.to_location || lead.to_location;
   const waypoints = Array.isArray(lead.waypoints) ? lead.waypoints : [];
   const pointSchedules = Array.isArray(tender.point_schedules)
      ? tender.point_schedules
      : [];
   const lastPointIndex = waypoints.length + 1;

   return (
      <Stack spacing={2}>
         <TenderDetailsSection icon={<RouteOutlinedIcon />} title={t("common.fields.route")}>
            <Stack spacing={1.25}>
               <RoutePoint
                  label={t("common.fields.origin")}
                  value={normalizeLocationValue(fromLocation)}
                  icon={<TripOriginIcon />}
                  date={getPointScheduleLabel(
                     getPointScheduleByIndex(pointSchedules, 0),
                  )}
               />

               {waypoints.map((waypoint, index) => (
                  <RoutePoint
                     key={waypoint.id || index}
                     label={t("route.waypointHash", { index: index + 1 })}
                     value={normalizeLocationValue(waypoint)}
                     icon={<LocationOnOutlinedIcon />}
                     date={getPointScheduleLabel(
                        getPointScheduleByIndex(pointSchedules, index + 1),
                     )}
                  />
               ))}

               <RoutePoint
                  label={t("common.fields.destination")}
                  value={normalizeLocationValue(toLocation)}
                  icon={<LocationOnOutlinedIcon />}
                  date={getPointScheduleLabel(
                     getPointScheduleByIndex(pointSchedules, lastPointIndex),
                  )}
               />
            </Stack>
         </TenderDetailsSection>

         <TenderDetailsSection
            icon={<LocalShippingOutlinedIcon />}
            title={t("common.fields.cargos")}
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
                           <TenderInfoBadge
                              label={t("common.fields.title")}
                              value={cargo.name || t("common.empty.notSpecifiedN")}
                           />

                           <TenderInfoBadge
                              label={t("common.fields.type")}
                              value={cargo.type || t("common.empty.notSpecifiedM")}
                           />

                           <TenderInfoBadge
                              label={t("common.fields.weight")}
                              value={
                                 hasValue(cargo.weight_kg)
                                    ? t("common.units.kg", { value: cargo.weight_kg })
                                    : t("common.empty.notSpecifiedM")
                              }
                           />

                           <TenderInfoBadge
                              label={t("common.fields.cargoPrice")}
                              value={getTenderCargoPriceLabel(
                                 cargo,
                                 lead.currency,
                              )}
                           />

                           <TenderInfoBadge
                              label={t("common.fields.volume")}
                              value={
                                 formatCargoVolumeM3(cargo.volume_m3) ||
                                 t("common.empty.notSpecifiedN")
                              }
                           />

                           {cargo.tnved?.code && (
                              <TenderInfoBadge
                                 label={t("common.fields.tnvedCode")}
                                 value={`${cargo.tnved.code} — ${cargo.tnved.name}`}
                              />
                           )}
                        </Box>

                        <TenderInfoBadge
                           label={t("common.fields.description")}
                           value={cargo.description || t("common.empty.notSpecifiedN")}
                           fullWidth
                           sx={{ mt: 1 }}
                        />
                     </Box>
                  ))
               ) : (
                  <TenderInfoBadge label={t("common.fields.cargo")} value={t("common.empty.notSpecifiedM")} fullWidth />
               )}

               <Box
                  sx={{
                     display: 'grid',
                     gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(3, 1fr)',
                     },
                     gap: 1,
                  }}
               >
                  <TenderInfoBadge
                     label={t("common.fields.cargoCountLabel")}
                     value={cargos.length || t("common.empty.notSpecifiedN")}
                  />

                  <TenderInfoBadge
                     label={t("common.fields.vat")}
                     value={lead.vat || t("common.empty.notSpecifiedM")}
                  />

                  <TenderInfoBadge
                     label={t("tenders.details.totalOrderPrice")}
                     value={
                        formatAmount(lead.summ)
                           ? `${formatAmount(lead.summ)} ${lead.currency || ''}`.trim()
                           : t("common.empty.notSpecifiedN")
                     }
                  />

                  <TenderInfoBadge
                     label={t("common.fields.gracePeriod")}
                     value={
                        lead.grace_period_days
                           ? t("common.units.days", { count: lead.grace_period_days })
                           : t("common.empty.notSpecifiedN")
                     }
                  />
               </Box>
            </Stack>
         </TenderDetailsSection>

         <TenderDetailsSection
            icon={<LocalShippingOutlinedIcon />}
            title={t("common.fields.transportParams")}
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
               {loadingTypeLabel && (
                  <TenderInfoBadge
                     label={t("common.fields.loadingType")}
                     value={loadingTypeLabel}
                  />
               )}

               {packagingTypeLabel && (
                  <TenderInfoBadge
                     label={t("common.fields.packagingType")}
                     value={packagingTypeLabel}
                  />
               )}

               {compositionTypeLabel && (
                  <TenderInfoBadge
                     label={t("common.fields.bodyType")}
                     value={compositionTypeLabel}
                  />
               )}

               {transportTypeLabel && (
                  <TenderInfoBadge
                     label={t("common.fields.transportType")}
                     value={transportTypeLabel}
                  />
               )}
            </Box>
         </TenderDetailsSection>
      </Stack>
   );
}

TenderTransportSection.propTypes = {
   tender: tenderPropType.isRequired,
};

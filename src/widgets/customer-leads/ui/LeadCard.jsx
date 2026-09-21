import PropTypes from 'prop-types';

import { alpha, Box, Stack, Tooltip, Typography } from '@mui/material';
import TripOriginIcon from '@mui/icons-material/TripOrigin';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ArrowRightAltRoundedIcon from '@mui/icons-material/ArrowRightAltRounded';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';

import { useLeadsContext } from '../model/useLeadsContext';
import { normalizeLocationValue } from '../model/lead-edit-form.helpers';
import { getLeadStatusLabel, getLeadStatusStyles } from '../model/lead.helpers';
import { formatAmount } from '../../../shared/helpers/currency-format.helpers';
import { StatusDot } from '../../../shared/ui/StatusDot';
import { pluralizeRu } from '../../../shared/helpers/plural.helpers';
import { getShortLocationLabel } from '../../../shared/helpers/data-grid.helpers';

// Russian plural rules for "груз" (1 груз / 2-4 груза / 5-20, 0 грузов).
function getCargoCountLabel(count) {
   const mod10 = count % 10;
   const mod100 = count % 100;

   if (mod10 === 1 && mod100 !== 11) {
      return `${count} груз`;
   }

   if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) {
      return `${count} груза`;
   }

   return `${count} грузов`;
}

function getCargoSummaryLabel(cargos) {
   if (!Array.isArray(cargos) || cargos.length === 0) {
      return null;
   }

   const totalWeight = cargos.reduce(
      (sum, cargo) => (typeof cargo?.weight_kg === 'number' ? sum + cargo.weight_kg : sum),
      0,
   );

   const countLabel = getCargoCountLabel(cargos.length);

   return totalWeight > 0 ? `${countLabel} · ${totalWeight} кг` : countLabel;
}

export function LeadCard({ lead }) {
   const { setOpenLead } = useLeadsContext();

   function handleOpenLead() {
      setOpenLead(lead);
   }

   function hasValue(value) {
      return value !== null && value !== undefined && value !== '';
   }

   const forwarderLabel =
      lead.forwarder?.fullName || lead.forwarder?.companyName || 'Не указан';

   const fromFullLabel = normalizeLocationValue(lead.from_location);
   const toFullLabel = normalizeLocationValue(lead.to_location);
   const fromShortLabel = getShortLocationLabel(lead.from_location, fromFullLabel);
   const toShortLabel = getShortLocationLabel(lead.to_location, toFullLabel);

   const waypointsCount = Array.isArray(lead.waypoints) ? lead.waypoints.length : 0;
   const cargoSummaryLabel = getCargoSummaryLabel(lead.cargos);

   return (
      <Box
         onClick={handleOpenLead}
         role="button"
         tabIndex={0}
         sx={{
            p: 3,
            border: '2px solid',
            borderColor: 'divider',
            borderRadius: 4,
            backgroundColor: 'background.paper',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            transition: '0.2s ease',
            cursor: 'pointer',
            '&:hover': {
               borderColor: 'primary.light',
               boxShadow: '0 8px 24px rgba(33, 150, 243, 0.12)',
            },
         }}
      >
         <Stack spacing={2}>
            <Box>
               <Typography
                  sx={{
                     lineHeight: 1.3,
                     fontSize: {
                        xs: '17px',
                        sm: '19px',
                     },
                     fontWeight: 600,
                  }}
               >
                  {forwarderLabel}
               </Typography>

               <Stack
                  direction="row"
                  spacing={0.75}
                  alignItems="center"
                  sx={{ mt: 0.5, color: 'text.secondary' }}
               >
                  <Typography variant="body2" color="text.secondary">
                     #{lead.num || '—'}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                     ·
                  </Typography>

                  <StatusDot
                     label={getLeadStatusLabel(lead.status)}
                     color={getLeadStatusStyles(lead.status).color}
                  />
               </Stack>
            </Box>

            <Stack
               direction="row"
               alignItems="center"
               spacing={0.75}
               sx={{
                  minWidth: 0,
                  flexWrap: 'nowrap',
                  overflow: 'hidden',
               }}
            >
               <TripOriginIcon sx={{ fontSize: 16, color: 'primary.main', flexShrink: 0 }} />

               <Tooltip title={fromFullLabel}>
                  <Typography
                     sx={{
                        fontSize: 14,
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        minWidth: 0,
                        flexShrink: 1,
                     }}
                  >
                     {fromShortLabel}
                  </Typography>
               </Tooltip>

               <ArrowRightAltRoundedIcon
                  sx={{ color: 'text.secondary', fontSize: 20, flexShrink: 0 }}
               />

               {waypointsCount > 0 && (
                  <>
                     <Box
                        sx={(theme) => ({
                           flexShrink: 0,
                           display: 'flex',
                           alignItems: 'center',
                           px: 0.75,
                           py: 0.25,
                           borderRadius: `${theme.radius.sm}px`,
                           backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        })}
                     >
                        <Typography
                           variant="caption"
                           color="text.secondary"
                           sx={{
                              fontSize: 11,
                              lineHeight: 1,
                              whiteSpace: 'nowrap',
                           }}
                        >
                           +{waypointsCount} {pluralizeRu(waypointsCount, ['точка', 'точки', 'точек'])}
                        </Typography>
                     </Box>

                     <ArrowRightAltRoundedIcon
                        sx={{ color: 'text.secondary', fontSize: 20, flexShrink: 0 }}
                     />
                  </>
               )}

               <LocationOnOutlinedIcon
                  sx={{ fontSize: 16, color: 'primary.main', flexShrink: 0 }}
               />

               <Tooltip title={toFullLabel}>
                  <Typography
                     sx={{
                        fontSize: 14,
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        minWidth: 0,
                        flexShrink: 1,
                     }}
                  >
                     {toShortLabel}
                  </Typography>
               </Tooltip>
            </Stack>

            {cargoSummaryLabel && (
               <Stack direction="row" alignItems="center" spacing={0.75}>
                  <LocalShippingOutlinedIcon
                     sx={{ fontSize: 16, color: 'text.secondary', flexShrink: 0 }}
                  />

                  <Typography variant="body2" color="text.secondary">
                     {cargoSummaryLabel}
                  </Typography>
               </Stack>
            )}

            <InfoBadge
               label="Цена"
               value={
                  hasValue(lead.summ)
                     ? `${formatAmount(lead.summ)} ${lead.currency}`
                     : 'Не указано'
               }
               accent
            />
         </Stack>
      </Box>
   );
}

function InfoBadge({ label, value, accent = false, sx = {} }) {
   return (
      <Box
         sx={{
            px: 1.5,
            py: 1,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            backgroundColor: 'grey.50',
            minWidth: 0,
            ...sx,
         }}
      >
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
            variant="dataEmphasis"
            sx={{
               color: accent ? 'primary.main' : 'text.primary',
            }}
         >
            {value || 'Не указано'}
         </Typography>
      </Box>
   );
}

LeadCard.propTypes = {
   lead: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      num: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      status: PropTypes.string.isRequired,
      from_location: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
      to_location: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
      waypoints: PropTypes.array,
      cargos: PropTypes.array,
      summ: PropTypes.number.isRequired,
      currency: PropTypes.string.isRequired,
      forwarder: PropTypes.shape({
         id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
         fullName: PropTypes.string,
         companyName: PropTypes.string,
         companyBin: PropTypes.string,
         phone: PropTypes.string,
      }),
   }).isRequired,
};

InfoBadge.propTypes = {
   label: PropTypes.string.isRequired,
   value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
   accent: PropTypes.bool,
   sx: PropTypes.object,
};

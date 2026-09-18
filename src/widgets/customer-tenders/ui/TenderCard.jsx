import { alpha, Box, Stack, Tooltip, Typography } from '@mui/material';
import ArrowRightAltRoundedIcon from '@mui/icons-material/ArrowRightAltRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import TripOriginIcon from '@mui/icons-material/TripOrigin';
import {
   getTimeLeft,
   publicationTypeLabels,
   tenderStatusLabels,
   tenderStatusStyles,
} from '../model/tender.helpers';
import { useTendersContext } from '../model/useTendersContext';
import PropTypes from 'prop-types';
import { tenderPropType } from '../model/tenders.prop-types';
import { normalizeLocationValue } from '../model/tender-edit-form.helpers';
import { StatusDot } from '../../../shared/ui/StatusDot';
import { getShortLocationLabel } from '../../../shared/helpers/data-grid.helpers';
import { formatAmount } from '../../../shared/helpers/currency-format.helpers';

function getShortTenderId(id) {
   if (!id) {
      return '—';
   }

   const value = String(id);

   if (value.length <= 12) {
      return value;
   }

   return `${value.slice(0, 4)}...${value.slice(-5)}`;
}

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

function getParticipantsCountLabel(count) {
   const value = Number(count) || 0;
   const mod10 = value % 10;
   const mod100 = value % 100;

   if (mod10 === 1 && mod100 !== 11) {
      return `${value} участник`;
   }

   if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) {
      return `${value} участника`;
   }

   return `${value} участников`;
}

export function TenderCard({ tender }) {
   const { openTenderDetails } = useTendersContext();

   const isCancelled = tender.status === 'cancelled';

   const shouldShowTimeLeft =
      tender.status !== 'closed' && tender.status !== 'cancelled';

   const fromFullLabel = normalizeLocationValue(tender.from_location);
   const toFullLabel = normalizeLocationValue(tender.to_location);
   const fromShortLabel = getShortLocationLabel(tender.from_location, fromFullLabel);
   const toShortLabel = getShortLocationLabel(tender.to_location, toFullLabel);

   const waypointsCount = Array.isArray(tender.waypoints) ? tender.waypoints.length : 0;
   const cargoSummaryLabel = getCargoSummaryLabel(tender.cargos);
   const participantsLabel = getParticipantsCountLabel(tender.participants_count);
   const publicationTypeLabel =
      publicationTypeLabels[tender.publication_type] || tender.publication_type;

   const fullTenderIdLabel = tender.id ? `#${tender.id}` : '#—';
   const shortTenderIdLabel = tender.id
      ? `#${getShortTenderId(tender.id)}`
      : '#—';

   function hasValue(value) {
      return value !== null && value !== undefined && value !== '';
   }

   function handleOpenTender() {
      openTenderDetails(tender);
   }

   return (
      <Box
         onClick={handleOpenTender}
         onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
               event.preventDefault();
               handleOpenTender();
            }
         }}
         role="button"
         tabIndex={0}
         sx={{
            p: 3,
            border: '2px solid',
            borderColor: isCancelled ? 'grey.300' : 'divider',
            borderRadius: 4,
            backgroundColor: isCancelled ? 'grey.100' : 'background.paper',
            boxShadow: isCancelled ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.06)',
            transition: '0.2s ease',
            cursor: 'pointer',
            opacity: isCancelled ? 0.82 : 1,
            '&:hover': {
               borderColor: isCancelled ? 'grey.400' : 'primary.light',
               boxShadow: isCancelled
                  ? '0 4px 12px rgba(0, 0, 0, 0.06)'
                  : '0 8px 24px rgba(33, 150, 243, 0.12)',
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
                  <Box
                     component="span"
                     sx={{
                        display: {
                           xs: 'inline',
                           md: 'none',
                        },
                     }}
                  >
                     {shortTenderIdLabel}
                  </Box>

                  <Box
                     component="span"
                     sx={{
                        display: {
                           xs: 'none',
                           md: 'inline',
                        },
                     }}
                  >
                     {fullTenderIdLabel}
                  </Box>
               </Typography>

               <Stack
                  direction="row"
                  spacing={0.75}
                  alignItems="center"
                  flexWrap="wrap"
                  sx={{ mt: 0.5, color: 'text.secondary' }}
               >
                  <Typography variant="body2" color="text.secondary">
                     {shortTenderIdLabel}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                     ·
                  </Typography>

                  <StatusDot
                     label={tenderStatusLabels[tender.status] || tender.status}
                     color={
                        (tenderStatusStyles[tender.status] ||
                           tenderStatusStyles.new).color
                     }
                  />

                  {shouldShowTimeLeft && (
                     <>
                        <Typography variant="body2" color="text.secondary">
                           ·
                        </Typography>

                        <TimeLeftBadge
                           value={getTimeLeft(tender.endDateTime, tender.status)}
                        />
                     </>
                  )}
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
                     {fromShortLabel || 'Не указано'}
                  </Typography>
               </Tooltip>

               <ArrowRightAltRoundedIcon
                  sx={{ color: 'text.secondary', fontSize: 20, flexShrink: 0 }}
               />

               {waypointsCount > 0 && (
                  <>
                     <MiniPill
                        label={`+${waypointsCount} ${waypointsCount === 1 ? 'точка' : 'точки'}`}
                     />

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
                     {toShortLabel || 'Не указано'}
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

            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
               <MiniPill label={participantsLabel} />
               <MiniPill label={publicationTypeLabel} />
            </Stack>

            <InfoBadge
               label="Цена"
               value={
                  hasValue(tender.summ)
                     ? `${formatAmount(tender.summ)} ${tender.currency}`
                     : 'Не указано'
               }
               accent
            />
         </Stack>
      </Box>
   );
}

function MiniPill({ label }) {
   return (
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
            {label}
         </Typography>
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

function TimeLeftBadge({ value }) {
   return (
      <Box
         sx={{
            px: 1.25,
            py: 0.45,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 999,
            backgroundColor: 'grey.50',
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
         }}
      >
         <Typography
            sx={{
               fontSize: 11,
               lineHeight: 1.2,
               color: 'text.secondary',
            }}
         >
            Осталось
         </Typography>

         <Typography
            sx={{
               fontSize: 12,
               lineHeight: 1.2,
               fontWeight: 600,
               color: 'text.primary',
            }}
         >
            {value || 'Не указано'}
         </Typography>
      </Box>
   );
}

TenderCard.propTypes = {
   tender: tenderPropType.isRequired,
};

MiniPill.propTypes = {
   label: PropTypes.node,
};

InfoBadge.propTypes = {
   label: PropTypes.string.isRequired,
   value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
   accent: PropTypes.bool,
   sx: PropTypes.object,
};

TimeLeftBadge.propTypes = {
   value: PropTypes.node,
};

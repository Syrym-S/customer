import { alpha, Box, Stack, Typography } from '@mui/material';
import i18n from '../../../shared/i18n';
import { useTranslation } from "react-i18next";
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import {
   getTimeLeft,
   getPublicationTypeLabel,
   getTenderStatusLabel,
   tenderStatusStyles,
} from '../model/tender.helpers';
import { useTendersContext } from '../model/useTendersContext';
import PropTypes from 'prop-types';
import { tenderPropType } from '../model/tenders.prop-types';
import { normalizeLocationValue } from '../model/tender-edit-form.helpers';
import { StatusDot } from '../../../shared/ui/StatusDot';
import { getShortLocationLabel } from '../../../shared/helpers/data-grid.helpers';
import { formatAmount } from '../../../shared/helpers/currency-format.helpers';
import { CardRouteLine } from '../../../shared/ui/CardRouteLine';

function getCargoSummaryLabel(cargos) {
   if (!Array.isArray(cargos) || cargos.length === 0) {
      return null;
   }

   const totalWeight = cargos.reduce(
      (sum, cargo) => (typeof cargo?.weight_kg === 'number' ? sum + cargo.weight_kg : sum),
      0,
   );

   const countLabel = i18n.t('common.cargoCount', { count: cargos.length });

   return totalWeight > 0
      ? i18n.t('common.units.cargoSummary', {
           cargoCount: countLabel,
           weight: totalWeight,
        })
      : countLabel;
}

function getParticipantsCountLabel(count) {
   return i18n.t('tenders.participantCount', { count: Number(count) || 0 });
}

export function TenderCard({ tender }) {
   const { t } = useTranslation();
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
      getPublicationTypeLabel(tender.publication_type) || tender.publication_type;

   const tenderName = String(tender.name || '').trim();
   const leadNum = tender.lead?.num ?? null;
   const orderNumLabel = leadNum
      ? `${t("common.fields.orderNum")} ${leadNum}`
      : '';
   const cardTitle = tenderName || orderNumLabel || t("tenders.titleSingular");

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
                  title={cardTitle}
                  sx={{
                     lineHeight: 1.3,
                     fontSize: {
                        xs: '17px',
                        sm: '19px',
                     },
                     fontWeight: 600,
                     overflow: 'hidden',
                     textOverflow: 'ellipsis',
                     whiteSpace: 'nowrap',
                  }}
               >
                  {cardTitle}
               </Typography>

               <Stack
                  direction="row"
                  spacing={0.75}
                  useFlexGap
                  sx={{
                     mt: 0.5,
                     color: 'text.secondary',
                     alignItems: 'center',
                     flexWrap: 'wrap',
                     rowGap: 0.75,
                  }}
               >
                  {tenderName && orderNumLabel && (
                     <>
                        <Typography
                           variant="body2"
                           color="text.secondary"
                           sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                        >
                           {orderNumLabel}
                        </Typography>

                        <Typography
                           variant="body2"
                           color="text.secondary"
                           sx={{
                              flexShrink: 0,
                              display: { xs: 'none', sm: 'block' },
                           }}
                        >
                           ·
                        </Typography>
                     </>
                  )}

                  <StatusDot
                     label={getTenderStatusLabel(tender.status) || tender.status}
                     color={
                        (tenderStatusStyles[tender.status] ||
                           tenderStatusStyles.new).color
                     }
                     sx={{ flexShrink: 0 }}
                  />

                  {shouldShowTimeLeft && (
                     <>
                        <Typography
                           variant="body2"
                           color="text.secondary"
                           sx={{
                              flexShrink: 0,
                              display: { xs: 'none', sm: 'block' },
                           }}
                        >
                           ·
                        </Typography>

                        <TimeLeftBadge
                           value={getTimeLeft(tender.endDateTime, tender.status)}
                        />
                     </>
                  )}
               </Stack>
            </Box>

            <CardRouteLine
               fromLabel={fromShortLabel || t("common.empty.notSpecifiedN")}
               fromTitle={fromFullLabel}
               toLabel={toShortLabel || t("common.empty.notSpecifiedN")}
               toTitle={toFullLabel}
               waypointsCount={waypointsCount}
            />

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

            <Stack
               direction="row"
               spacing={0.75}
               useFlexGap
               sx={{ flexWrap: 'wrap', rowGap: 0.75 }}
            >
               <MiniPill label={participantsLabel} />
               <MiniPill label={publicationTypeLabel} />
            </Stack>

            <InfoBadge
               label={t("common.fields.price")}
               value={
                  hasValue(tender.summ)
                     ? `${formatAmount(tender.summ)} ${tender.currency}`
                     : t("common.empty.notSpecifiedN")
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
   const { t } = useTranslation();

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
            {value || t("common.empty.notSpecifiedN")}
         </Typography>
      </Box>
   );
}

function TimeLeftBadge({ value }) {
   const { t } = useTranslation();

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
            flexShrink: 0,
            whiteSpace: 'nowrap',
         }}
      >
         <Typography
            sx={{
               fontSize: 11,
               lineHeight: 1.2,
               color: 'text.secondary',
            }}
         >
            {t("common.fields.timeLeft")}
         </Typography>

         <Typography
            sx={{
               fontSize: 12,
               lineHeight: 1.2,
               fontWeight: 600,
               color: 'text.primary',
            }}
         >
            {value || t("common.empty.notSpecifiedN")}
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

import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
   alpha,
   Box,
   Stack,
   Tooltip,
   Typography,
   useTheme,
} from '@mui/material';
import TripOriginIcon from '@mui/icons-material/TripOrigin';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ArrowRightAltRoundedIcon from '@mui/icons-material/ArrowRightAltRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import HourglassBottomRoundedIcon from '@mui/icons-material/HourglassBottomRounded';

import { StatusDot } from '../../../shared/ui/StatusDot';
import {
   formatAdvertisementDateTime,
   getAdvertisementLeadNumberLabel,
   getAdvertisementPriceLabel,
   getAdvertisementStatusColor,
   getAdvertisementStatusLabel,
   isAdvertisementClosed,
} from '../model/advertisement.helpers';

export function AdvertisementCard({ advertisement, onOpen }) {
   const { t } = useTranslation();
   const theme = useTheme();

   const isRtl = theme.direction === 'rtl';
   const isClosed = isAdvertisementClosed(advertisement);

   const lead = advertisement.lead || {};

   const numberLabel = getAdvertisementLeadNumberLabel(lead);
   const priceLabel = getAdvertisementPriceLabel(lead);
   const firstPointLabel = formatAdvertisementDateTime(lead.firstPointAt);
   const createdLabel = formatAdvertisementDateTime(advertisement.createdAt);
   const expiredLabel = formatAdvertisementDateTime(advertisement.expiredAt);

   const fromLabel = lead.fromLocation || t('common.empty.notSpecifiedN');
   const toLabel = lead.toLocation || t('common.empty.notSpecifiedN');

   const fromTitle = lead.fromLocationFull || fromLabel;
   const toTitle = lead.toLocationFull || toLabel;

   function handleOpen() {
      onOpen?.(advertisement);
   }

   function handleKeyDown(event) {
      if (event.key === 'Enter' || event.key === ' ') {
         event.preventDefault();
         handleOpen();
      }
   }

   return (
      <Box
         onClick={handleOpen}
         onKeyDown={handleKeyDown}
         role="button"
         tabIndex={0}
         sx={{
            p: 3,
            border: '2px solid',
            borderColor: 'divider',
            borderRadius: 4,
            backgroundColor: isClosed
               ? alpha(theme.palette.text.primary, 0.03)
               : 'background.paper',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            opacity: isClosed ? 0.8 : 1,
            cursor: 'pointer',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            '&:hover': {
               borderColor: 'primary.light',
               boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
            },
         }}
      >
         <Stack spacing={2}>
            <Stack
               direction="row"
               justifyContent="space-between"
               alignItems="flex-start"
               spacing={1.5}
            >
               <Box sx={{ minWidth: 0 }}>
                  <Typography
                     sx={{
                        lineHeight: 1.3,
                        fontSize: { xs: '17px', sm: '19px' },
                        fontWeight: 600,
                     }}
                  >
                     {numberLabel || t('advertisements.titleSingular')}
                  </Typography>

                  <Stack
                     direction="row"
                     spacing={0.75}
                     alignItems="center"
                     sx={{ mt: 0.5 }}
                  >
                     <StatusDot
                        label={getAdvertisementStatusLabel(advertisement)}
                        color={getAdvertisementStatusColor(advertisement)}
                     />

                     {createdLabel && (
                        <>
                           <Typography variant="body2" color="text.secondary">
                              ·
                           </Typography>

                           <Typography variant="body2" color="text.secondary">
                              {createdLabel}
                           </Typography>
                        </>
                     )}
                  </Stack>
               </Box>

               {priceLabel && (
                  <Typography
                     sx={{ fontSize: 16, fontWeight: 700, whiteSpace: 'nowrap' }}
                  >
                     {priceLabel}
                  </Typography>
               )}
            </Stack>

            <Stack
               direction="row"
               alignItems="center"
               spacing={0.75}
               sx={{ minWidth: 0, flexWrap: 'nowrap', overflow: 'hidden' }}
            >
               <TripOriginIcon
                  sx={{ fontSize: 16, color: 'primary.main', flexShrink: 0 }}
               />

               <Tooltip title={fromTitle}>
                  <Typography
                     sx={{
                        fontSize: 14,
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        minWidth: 0,
                     }}
                  >
                     {fromLabel}
                  </Typography>
               </Tooltip>

               <ArrowRightAltRoundedIcon
                  sx={{
                     color: 'text.secondary',
                     fontSize: 20,
                     flexShrink: 0,
                     transform: isRtl ? 'scaleX(-1)' : 'none',
                  }}
               />

               <LocationOnOutlinedIcon
                  sx={{ fontSize: 16, color: 'primary.main', flexShrink: 0 }}
               />

               <Tooltip title={toTitle}>
                  <Typography
                     sx={{
                        fontSize: 14,
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        minWidth: 0,
                     }}
                  >
                     {toLabel}
                  </Typography>
               </Tooltip>
            </Stack>

            <Stack
               direction="row"
               spacing={2}
               flexWrap="wrap"
               useFlexGap
               sx={{ color: 'text.secondary' }}
            >
               <Stack direction="row" alignItems="center" spacing={0.75}>
                  <ScheduleRoundedIcon sx={{ fontSize: 16 }} />

                  <Typography variant="body2" color="text.secondary">
                     {firstPointLabel || t('common.empty.notSpecifiedN')}
                  </Typography>
               </Stack>

               {expiredLabel && (
                  <Tooltip title={t('advertisements.fields.expiredAt')}>
                     <Stack direction="row" alignItems="center" spacing={0.75}>
                        <HourglassBottomRoundedIcon sx={{ fontSize: 16 }} />

                        <Typography variant="body2" color="text.secondary">
                           {expiredLabel}
                        </Typography>
                     </Stack>
                  </Tooltip>
               )}

               {lead.cargo && (
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                     <LocalShippingOutlinedIcon sx={{ fontSize: 16 }} />

                     <Typography variant="body2" color="text.secondary">
                        {lead.cargo}
                     </Typography>
                  </Stack>
               )}
            </Stack>
         </Stack>
      </Box>
   );
}

AdvertisementCard.propTypes = {
   advertisement: PropTypes.shape({
      id: PropTypes.string.isRequired,
      createdAt: PropTypes.string,
      expiredAt: PropTypes.string,
      closedAt: PropTypes.string,
      lead: PropTypes.object,
   }).isRequired,
   onOpen: PropTypes.func,
};

import { Box, Chip, Stack, Typography } from '@mui/material';
import ArrowRightAltRoundedIcon from '@mui/icons-material/ArrowRightAltRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import TripOriginIcon from '@mui/icons-material/TripOrigin';
import {
   getTimeLeft,
   hasValue,
   tenderStatusLabels,
   tenderStatusStyles,
} from '../model/tender.helpers';
import { useTendersContext } from '../model/useTendersContext';
import PropTypes from 'prop-types';
import { sxPropType, tenderPropType } from '../model/tenders.propTypes';

export function TenderCard({ tender }) {
   const { openTenderDetails } = useTendersContext();

   const shouldShowTimeLeft =
      tender.status !== 'closed' && tender.status !== 'cancelled';

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
         role='button'
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
         <Stack spacing={2.5}>
            <Box
               sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 2,
                  flexWrap: 'wrap',
               }}
            >
               <Box>
                  <Typography
                     variant='body2'
                     color='text.secondary'
                     sx={{ mb: 0.75 }}
                  >
                     Тендер
                  </Typography>

                  <Typography
                     sx={{
                        lineHeight: 1.3,
                        fontSize: {
                           xs: '16px',
                           sm: '18px',
                        },
                        fontWeight: 500,
                     }}
                  >
                     Тендер #{tender.id || '—'}
                  </Typography>
               </Box>

               <Stack
                  direction='row'
                  spacing={1}
                  useFlexGap
                  sx={{
                     flexWrap: 'wrap',
                     justifyContent: {
                        xs: 'flex-start',
                        sm: 'flex-end',
                     },
                  }}
               >
                  {shouldShowTimeLeft && (
                     <TimeLeftBadge
                        value={getTimeLeft(tender.endDateTime, tender.status)}
                     />
                  )}

                  <Chip
                     label={tenderStatusLabels[tender.status] || tender.status}
                     variant='outlined'
                     size='small'
                     sx={{
                        borderRadius: 999,
                        fontWeight: 600,
                        ...(tenderStatusStyles[tender.status] ||
                           tenderStatusStyles.new),
                     }}
                  />
               </Stack>
            </Box>

            <Box
               sx={{
                  display: 'flex',
                  alignItems: 'stretch',
                  gap: 1.5,
                  flexWrap: {
                     xs: 'wrap',
                     sm: 'nowrap',
                  },
               }}
            >
               <Box
                  sx={{
                     flex: 1,
                     minWidth: 220,
                     minHeight: 86,
                     p: 1.5,
                     border: '1px solid',
                     borderColor: 'divider',
                     borderRadius: 2,
                     backgroundColor: 'grey.50',
                     display: 'flex',
                     flexDirection: 'column',
                     justifyContent: 'flex-start',
                  }}
               >
                  <Typography
                     variant='caption'
                     sx={{
                        display: 'block',
                        color: 'text.secondary',
                        mb: 0.5,
                     }}
                  >
                     Откуда
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                     <TripOriginIcon
                        sx={{ fontSize: 18, color: 'primary.main' }}
                     />

                     <Typography
                        fontWeight={500}
                        sx={{
                           fontSize: 14,
                           lineHeight: 1.35,
                        }}
                     >
                        {tender.from_location || 'Не указано'}
                     </Typography>
                  </Box>
               </Box>

               <Box
                  sx={{
                     display: {
                        xs: 'none',
                        sm: 'flex',
                     },
                     alignItems: 'center',
                     justifyContent: 'center',
                     px: 0.5,
                  }}
               >
                  <ArrowRightAltRoundedIcon
                     sx={{
                        color: 'text.secondary',
                        fontSize: 28,
                     }}
                  />
               </Box>

               <Box
                  sx={{
                     flex: 1,
                     minWidth: 220,
                     minHeight: 96,
                     p: 1.5,
                     border: '1px solid',
                     borderColor: 'divider',
                     borderRadius: 2,
                     backgroundColor: 'grey.50',
                     display: 'flex',
                     flexDirection: 'column',
                     justifyContent: 'flex-start',
                  }}
               >
                  <Typography
                     variant='caption'
                     sx={{
                        display: 'block',
                        color: 'text.secondary',
                        mb: 0.5,
                     }}
                  >
                     Куда
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                     <LocationOnOutlinedIcon
                        sx={{ fontSize: 18, color: 'primary.main' }}
                     />

                     <Typography
                        fontWeight={500}
                        sx={{
                           fontSize: 14,
                           lineHeight: 1.35,
                        }}
                     >
                        {tender.to_location || 'Не указано'}
                     </Typography>
                  </Box>
               </Box>
            </Box>

            <Box
               sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                     xs: '1fr 1fr',
                     md: 'repeat(3, 1fr)',
                  },
                  gap: 1,
               }}
            >
               <InfoBadge
                  label='Вес'
                  value={
                     hasValue(tender.cargo?.weight_kg)
                        ? `${tender.cargo.weight_kg} кг`
                        : 'Не указано'
                  }
               />

               <InfoBadge
                  label='Тип'
                  value={tender.cargo?.type || 'Не указан'}
               />

               <InfoBadge
                  label='Цена'
                  value={
                     hasValue(tender.summ)
                        ? `${tender.summ} ${tender.currency}`
                        : 'Не указано'
                  }
                  accent
               />
            </Box>
         </Stack>
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
            sx={{
               fontSize: 14,
               lineHeight: 1.3,
               color: accent ? 'primary.main' : 'text.primary',
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

InfoBadge.propTypes = {
   label: PropTypes.string.isRequired,
   value: PropTypes.node,
   accent: PropTypes.bool,
   sx: sxPropType,
};

TimeLeftBadge.propTypes = {
   value: PropTypes.node,
};

import PropTypes from 'prop-types';

import { Box, Chip, Stack, Typography } from '@mui/material';
import TripOriginIcon from '@mui/icons-material/TripOrigin';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ArrowRightAltRoundedIcon from '@mui/icons-material/ArrowRightAltRounded';

import { useLeadsContext } from '../model/useLeadsContext';

export function LeadCard({ lead }) {
   const { setOpenLead } = useLeadsContext();

   function handleOpenLead() {
      setOpenLead(lead);
   }

   return (
      <Box
         onClick={handleOpenLead}
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
                     Заказчик
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
                     {lead.customer}
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
                  <Chip
                     label={`Лид #${lead.num || '—'}`}
                     color='primary'
                     variant='outlined'
                     size='small'
                     sx={{
                        borderRadius: 999,
                        fontWeight: 600,
                        backgroundColor: 'rgba(33, 150, 243, 0.04)',
                     }}
                  />

                  <Chip
                     label={lead.status}
                     size='small'
                     sx={{
                        borderRadius: 999,
                        fontWeight: 500,
                        backgroundColor: 'grey.100',
                        color: 'text.secondary',
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
                        {lead.from_location.trim()}
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
                        {lead.to_location.trim()}
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
               <InfoBadge label='Вес' value={`${lead.cargo.weight_kg} кг`} />

               <InfoBadge label='Тип' value={lead.cargo.type} />

               <InfoBadge
                  label='Цена'
                  value={`${lead.summ} ${lead.currency}`}
                  accent
                  sx={{
                     gridColumn: {
                        xs: '1 / -1',
                        md: 'auto',
                     },
                  }}
               />
            </Box>
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

LeadCard.propTypes = {
   lead: PropTypes.shape({
      id: PropTypes.string.isRequired,
      num: PropTypes.number,
      status: PropTypes.string.isRequired,
      from_location: PropTypes.string.isRequired,
      to_location: PropTypes.string.isRequired,
      customer: PropTypes.string.isRequired,
      summ: PropTypes.number.isRequired,
      currency: PropTypes.string.isRequired,
      cargo: PropTypes.shape({
         weight_kg: PropTypes.number.isRequired,
         type: PropTypes.string.isRequired,
      }).isRequired,
   }).isRequired,
};

InfoBadge.propTypes = {
   label: PropTypes.string.isRequired,
   value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
   accent: PropTypes.bool,
   sx: PropTypes.object,
};

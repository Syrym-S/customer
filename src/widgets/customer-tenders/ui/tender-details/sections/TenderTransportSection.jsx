import { Box, Stack } from '@mui/material';
import ArrowRightAltRoundedIcon from '@mui/icons-material/ArrowRightAltRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined';
import TripOriginIcon from '@mui/icons-material/TripOrigin';

import { TenderDetailSection } from './TenderDetailSection';
import { TenderInfoBadge } from './TenderInfoBadge';

import PropTypes from 'prop-types';
import { tenderPropType } from '../../../model/tenders.propTypes';
import { normalizeLocationValue } from '../../../model/tenderEditFrom.helpers';

export function TenderTransportSection({ tender }) {
   const lead = tender.lead || {};
   const cargo = lead.cargo || {};

   return (
      <Stack spacing={2}>
         <TenderDetailSection icon={<RouteOutlinedIcon />} title='Маршрут'>
            <Box
               sx={{
                  display: 'flex',
                  alignItems: 'stretch',
                  gap: 1.5,
                  flexWrap: {
                     xs: 'wrap',
                     md: 'nowrap',
                  },
               }}
            >
               <TenderInfoBadge
                  label='Откуда'
                  value={normalizeLocationValue(lead.from_location)}
                  icon={<TripOriginIcon />}
                  fullWidth
               />

               <Box
                  sx={{
                     display: {
                        xs: 'none',
                        md: 'flex',
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

               <TenderInfoBadge
                  label='Куда'
                  value={normalizeLocationValue(lead.to_location)}
                  icon={<LocationOnOutlinedIcon />}
                  fullWidth
               />
            </Box>
         </TenderDetailSection>

         <TenderDetailSection icon={<Inventory2OutlinedIcon />} title='Груз'>
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
               <TenderInfoBadge label='Тип' value={cargo.type} />

               <TenderInfoBadge
                  label='Вес'
                  value={
                     cargo.weight_kg ? `${cargo.weight_kg} кг` : 'Не указан'
                  }
               />

               <TenderInfoBadge
                  label='Цена'
                  value={
                     lead.summ
                        ? `${lead.summ} ${lead.currency || 'KZT'}`
                        : 'Не указана'
                  }
                  accent
               />

               <TenderInfoBadge label='НДС' value={lead.vat || 'Не указан'} />
            </Box>

            <TenderInfoBadge
               label='Описание'
               value={cargo.description || 'Не указано'}
               fullWidth
               sx={{ mt: 1 }}
            />
         </TenderDetailSection>
      </Stack>
   );
}

function RoutePoint({ label, value, icon }) {
   return (
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
         <Box
            sx={{
               fontSize: 12,
               lineHeight: 1.2,
               color: 'text.secondary',
               mb: 0.75,
            }}
         >
            {label}
         </Box>

         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
               sx={{
                  display: 'flex',
                  color: 'primary.main',
                  '& svg': {
                     fontSize: 18,
                  },
               }}
            >
               {icon}
            </Box>

            <Box
               sx={{
                  fontSize: 14,
                  lineHeight: 1.35,
                  fontWeight: 500,
               }}
            >
               {value || 'Не указано'}
            </Box>
         </Box>
      </Box>
   );
}

TenderTransportSection.propTypes = {
   tender: tenderPropType.isRequired,
};

RoutePoint.propTypes = {
   label: PropTypes.string.isRequired,
   value: PropTypes.node,
   icon: PropTypes.node.isRequired,
};

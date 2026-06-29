import { Box, Stack } from '@mui/material';
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

export function TenderTransportSection({ tender }) {
   const lead = tender.lead || {};
   const cargo = lead.cargo || {};

   const fromLocation = tender.from_location || lead.from_location;
   const toLocation = tender.to_location || lead.to_location;

   return (
      <Stack spacing={2}>
         <TenderDetailsSection icon={<RouteOutlinedIcon />} title='Маршрут'>
            <Box
               sx={{
                  display: 'flex',
                  alignItems: 'stretch',
                  gap: {
                     xs: 1,
                     sm: 1.5,
                  },
                  flexDirection: {
                     xs: 'column',
                     md: 'row',
                  },
                  minWidth: 0,
                  width: '100%',
               }}
            >
               <RoutePoint
                  label='Откуда'
                  value={normalizeLocationValue(fromLocation)}
                  icon={<TripOriginIcon />}
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

               <RoutePoint
                  label='Куда'
                  value={normalizeLocationValue(toLocation)}
                  icon={<LocationOnOutlinedIcon />}
               />
            </Box>
         </TenderDetailsSection>

         <TenderDetailsSection
            icon={<LocalShippingOutlinedIcon />}
            title='Груз'
         >
            <Box
               sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                     xs: '1fr 1fr',
                     sm: 'repeat(2, 1fr)',
                     md: 'repeat(3, 1fr)',
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

               <TenderInfoBadge label='НДС' value={lead.vat || 'Не указан'} />
            </Box>

            <TenderInfoBadge
               label='Описание'
               value={cargo.description || 'Не указано'}
               fullWidth
               sx={{ mt: 1 }}
            />
         </TenderDetailsSection>
      </Stack>
   );
}

TenderTransportSection.propTypes = {
   tender: tenderPropType.isRequired,
};

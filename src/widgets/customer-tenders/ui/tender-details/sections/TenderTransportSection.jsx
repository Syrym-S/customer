import { Box } from '@mui/material';
import ArrowRightAltRoundedIcon from '@mui/icons-material/ArrowRightAltRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import TripOriginIcon from '@mui/icons-material/TripOrigin';

import { hasValue } from '../../../model/tender.helpers';
import { TenderDetailSection } from './TenderDetailSection';
import { TenderInfoBadge } from './TenderInfoBadge';

import PropTypes from 'prop-types';
import { tenderPropType } from '../../../model/tenders.propTypes';

export function TenderTransportSection({ tender }) {
   return (
      <TenderDetailSection
         icon={<LocalShippingOutlinedIcon />}
         title='Данные перевозки'
      >
         <Box
            sx={{
               display: 'flex',
               alignItems: 'stretch',
               gap: 1.5,
               flexWrap: {
                  xs: 'wrap',
                  md: 'nowrap',
               },
               mb: 1,
            }}
         >
            <RoutePoint
               label='Откуда'
               value={tender.from_location}
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
               value={tender.to_location}
               icon={<LocationOnOutlinedIcon />}
            />
         </Box>

         <Box
            sx={{
               display: 'grid',
               gridTemplateColumns: {
                  xs: '1fr 1fr',
                  md: 'repeat(4, 1fr)',
               },
               gap: 1,
            }}
         >
            <TenderInfoBadge
               label='Вес'
               value={
                  hasValue(tender.cargo?.weight_kg)
                     ? `${tender.cargo.weight_kg} кг`
                     : 'Не указано'
               }
            />

            <TenderInfoBadge
               label='Тип'
               value={tender.cargo?.type || 'Не указан'}
            />

            <TenderInfoBadge
               label='Цена'
               value={
                  hasValue(tender.summ)
                     ? `${tender.summ} ${tender.currency}`
                     : 'Не указано'
               }
               accent
               sx={{
                  gridColumn: {
                     xs: '1 / -1',
                     md: 'auto',
                  },
               }}
            />

            <TenderInfoBadge label='НДС' value={tender.vat || 'Не указано'} />

            <Box sx={{ gridColumn: '1 / -1' }}>
               <TenderInfoBadge
                  label='Описание'
                  value={tender.cargo?.description || 'Не указано'}
               />
            </Box>
         </Box>
      </TenderDetailSection>
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

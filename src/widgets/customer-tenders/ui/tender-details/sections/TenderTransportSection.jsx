import { Box, Stack, Typography } from '@mui/material';
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

export function TenderTransportSection({ tender }) {
   const lead = tender.lead || {};
   const cargos = getTenderCargos(tender);

   const fromLocation = tender.from_location || lead.from_location;
   const toLocation = tender.to_location || lead.to_location;

   return (
      <Stack spacing={2}>
         <TenderDetailsSection icon={<RouteOutlinedIcon />} title="Маршрут">
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
                  label="Откуда"
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
                  label="Куда"
                  value={normalizeLocationValue(toLocation)}
                  icon={<LocationOnOutlinedIcon />}
               />
            </Box>
         </TenderDetailsSection>

         <TenderDetailsSection
            icon={<LocalShippingOutlinedIcon />}
            title="Грузы"
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
                           Груз #{index + 1}
                        </Typography>

                        <Box
                           sx={{
                              display: 'grid',
                              gridTemplateColumns: {
                                 xs: '1fr 1fr',
                                 sm: 'repeat(2, 1fr)',
                                 md: 'repeat(4, 1fr)',
                              },
                              gap: 1,
                           }}
                        >
                           <TenderInfoBadge
                              label="Наименование"
                              value={cargo.name || 'Не указано'}
                           />

                           <TenderInfoBadge
                              label="Тип"
                              value={cargo.type || 'Не указан'}
                           />

                           <TenderInfoBadge
                              label="Вес"
                              value={
                                 hasValue(cargo.weight_kg)
                                    ? `${cargo.weight_kg} кг`
                                    : 'Не указан'
                              }
                           />

                           <TenderInfoBadge
                              label="Цена груза"
                              value={getTenderCargoPriceLabel(
                                 cargo,
                                 lead.currency,
                              )}
                           />
                        </Box>

                        <TenderInfoBadge
                           label="Описание"
                           value={cargo.description || 'Не указано'}
                           fullWidth
                           sx={{ mt: 1 }}
                        />
                     </Box>
                  ))
               ) : (
                  <TenderInfoBadge label="Груз" value="Не указан" fullWidth />
               )}

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
                  <TenderInfoBadge
                     label="Количество грузов"
                     value={cargos.length || 'Не указано'}
                  />

                  <TenderInfoBadge
                     label="НДС"
                     value={lead.vat || 'Не указан'}
                  />

                  <TenderInfoBadge
                     label="Общая цена лида"
                     value={
                        hasValue(lead.summ)
                           ? `${Number(lead.summ).toLocaleString('ru-RU')} ${lead.currency || ''}`.trim()
                           : 'Не указано'
                     }
                  />
               </Box>
            </Stack>
         </TenderDetailsSection>
      </Stack>
   );
}

TenderTransportSection.propTypes = {
   tender: tenderPropType.isRequired,
};

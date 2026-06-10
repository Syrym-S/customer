import { Box, MenuItem, Stack, TextField } from '@mui/material';
import PropTypes from 'prop-types';

import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';

import { DetailSection } from '../components/DetailSection';
import { InfoBadge } from '../components/InfoBadge';

export function LeadCargoSection({ lead, isEditing, editForm, onEditChange }) {
   return (
      <DetailSection icon={<LocalShippingOutlinedIcon />} title='Груз'>
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
            {isEditing ? (
               <TextField
                  name='cargoType'
                  label='Тип груза'
                  value={editForm.cargoType || 'Не указан'}
                  onChange={onEditChange}
                  fullWidth
                  size='small'
                  select
               >
                  <MenuItem value='Не указан'>Не указан</MenuItem>
                  <MenuItem value='Паллеты'>Паллеты</MenuItem>
                  <MenuItem value='Коробки'>Коробки</MenuItem>
                  <MenuItem value='Оборудование'>Оборудование</MenuItem>
               </TextField>
            ) : (
               <InfoBadge label='Тип' value={lead.cargo.type} />
            )}

            {isEditing ? (
               <TextField
                  name='weight_kg'
                  label='Вес, кг'
                  value={editForm.weight_kg}
                  onChange={onEditChange}
                  fullWidth
                  size='small'
               />
            ) : (
               <InfoBadge label='Вес' value={`${lead.cargo.weight_kg} кг`} />
            )}

            {isEditing ? (
               <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <TextField
                     name='summ'
                     label='Цена'
                     value={editForm.summ}
                     onChange={onEditChange}
                     fullWidth
                     size='small'
                  />

                  <TextField
                     name='currency'
                     label='Валюта'
                     value={editForm.currency || 'KZT'}
                     onChange={onEditChange}
                     select
                     size='small'
                     sx={{
                        minWidth: {
                           xs: '100%',
                           sm: 120,
                        },
                     }}
                  >
                     <MenuItem value='KZT'>KZT</MenuItem>
                     <MenuItem value='USD'>USD</MenuItem>
                     <MenuItem value='EUR'>EUR</MenuItem>
                     <MenuItem value='RUB'>RUB</MenuItem>
                  </TextField>
               </Stack>
            ) : (
               <InfoBadge
                  label='Цена'
                  value={`${lead.summ} ${lead.currency}`}
                  accent
               />
            )}

            {isEditing ? (
               <TextField
                  name='vat'
                  label='НДС'
                  value={editForm.vat || 'без НДС'}
                  onChange={onEditChange}
                  fullWidth
                  size='small'
                  select
               >
                  <MenuItem value='с НДС'>с НДС</MenuItem>
                  <MenuItem value='без НДС'>без НДС</MenuItem>
               </TextField>
            ) : (
               <InfoBadge label='НДС' value={lead.vat} />
            )}
         </Box>

         {isEditing ? (
            <TextField
               name='cargoDescription'
               label='Описание'
               value={editForm.cargoDescription}
               onChange={onEditChange}
               fullWidth
               multiline
               minRows={3}
               size='small'
               sx={{ mt: 1 }}
            />
         ) : (
            <InfoBadge
               label='Описание'
               value={lead.cargo.description}
               fullWidth
               sx={{ mt: 1 }}
            />
         )}
      </DetailSection>
   );
}

LeadCargoSection.propTypes = {
   lead: PropTypes.object.isRequired,
   isEditing: PropTypes.bool.isRequired,
   editForm: PropTypes.object.isRequired,
   onEditChange: PropTypes.func.isRequired,
};

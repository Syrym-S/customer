import { Box, TextField } from '@mui/material';
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
                  label='Тип'
                  value={editForm.cargoType}
                  onChange={onEditChange}
                  fullWidth
                  size='small'
               />
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
               <TextField
                  name='summ'
                  label='Цена'
                  value={editForm.summ}
                  onChange={onEditChange}
                  fullWidth
                  size='small'
               />
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
                  value={editForm.vat}
                  onChange={onEditChange}
                  fullWidth
                  size='small'
               />
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

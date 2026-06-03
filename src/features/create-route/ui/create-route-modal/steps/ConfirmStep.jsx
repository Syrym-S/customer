import { Box } from '@mui/material';
import PropTypes from 'prop-types';

import { InfoBadge } from '../components/InfoBadge';
import { StepSection } from '../components/StepSection';

export function ConfirmStep({ form }) {
   return (
      <Box sx={{ display: 'grid', gap: 2 }}>
         <StepSection title='Проверьте данные'>
            <Box
               sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                     xs: '1fr',
                     sm: '1fr 1fr',
                  },
                  gap: 1,
               }}
            >
               <InfoBadge label='Заказчик' value={form.customer} />

               <InfoBadge label='Контакт' value={form.contactName} />

               <InfoBadge label='Откуда' value={form.fromLocation} />

               <InfoBadge label='Куда' value={form.toLocation} />

               <InfoBadge label='Дата загрузки' value={form.loadingDate} />

               <InfoBadge label='Тип груза' value={form.cargoType} />

               <InfoBadge label='Вес' value={`${form.weightKg} кг`} />

               <InfoBadge
                  label='Размеры'
                  value={`${form.cargoLengthCm} × ${form.cargoWidthCm} × ${form.cargoHeightCm} см`}
               />

               <InfoBadge
                  label='Цена'
                  value={`${form.price} ${form.currency}`}
                  accent
               />
            </Box>
         </StepSection>
      </Box>
   );
}

ConfirmStep.propTypes = {
   form: PropTypes.object.isRequired,
};

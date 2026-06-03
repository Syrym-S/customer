import { Box, TextField } from '@mui/material';
import PropTypes from 'prop-types';
import { Controller } from 'react-hook-form';

import { StepSection } from '../components/StepSection';

export function CustomerStep({ control, errors }) {
   return (
      <StepSection title='Данные заказчика'>
         <Box
            sx={{
               display: 'grid',
               gridTemplateColumns: {
                  xs: '1fr',
                  sm: '1fr 1fr',
               },
               gap: 2,
            }}
         >
            <Controller
               name='customer'
               control={control}
               rules={{
                  required: 'Укажите заказчика',
                  minLength: {
                     value: 3,
                     message: 'Минимум 3 символа',
                  },
               }}
               render={({ field }) => (
                  <TextField
                     {...field}
                     label='Заказчик'
                     fullWidth
                     size='small'
                     error={Boolean(errors.customer)}
                     helperText={errors.customer?.message}
                  />
               )}
            />

            <Controller
               name='contactName'
               control={control}
               render={({ field }) => (
                  <TextField
                     {...field}
                     label='Контактное лицо'
                     fullWidth
                     size='small'
                  />
               )}
            />

            <Controller
               name='phone'
               control={control}
               rules={{
                  required: 'Укажите телефон',
                  pattern: {
                     value: /^\+?[0-9\s()-]{10,20}$/,
                     message: 'Некорректный формат телефона',
                  },
               }}
               render={({ field }) => (
                  <TextField
                     {...field}
                     label='Телефон'
                     fullWidth
                     size='small'
                     error={Boolean(errors.phone)}
                     helperText={errors.phone?.message}
                  />
               )}
            />
         </Box>
      </StepSection>
   );
}

CustomerStep.propTypes = {
   control: PropTypes.object.isRequired,
   errors: PropTypes.object.isRequired,
};

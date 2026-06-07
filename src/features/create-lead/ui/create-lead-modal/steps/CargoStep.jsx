import {
   Box,
   FormControlLabel,
   MenuItem,
   Switch,
   TextField,
} from '@mui/material';
import PropTypes from 'prop-types';
import { Controller } from 'react-hook-form';

import { StepSection } from '../components/StepSection';

export function CargoStep({ control, errors }) {
   return (
      <StepSection title='Груз и оплата'>
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
               name='cargoType'
               control={control}
               render={({ field }) => (
                  <TextField
                     {...field}
                     select
                     label='Тип груза'
                     fullWidth
                     size='small'
                  >
                     <MenuItem value='Не указан'>Не указан</MenuItem>
                     <MenuItem value='Паллеты'>Паллеты</MenuItem>
                     <MenuItem value='Коробки'>Коробки</MenuItem>
                     <MenuItem value='Оборудование'>Оборудование</MenuItem>
                  </TextField>
               )}
            />

            <Controller
               name='weightKg'
               control={control}
               rules={{
                  required: 'Укажите вес',
                  validate: (value) =>
                     Number(value) > 0 || 'Вес должен быть больше 0',
               }}
               render={({ field }) => (
                  <TextField
                     {...field}
                     label='Вес, кг'
                     fullWidth
                     size='small'
                     error={Boolean(errors.weightKg)}
                     helperText={errors.weightKg?.message}
                  />
               )}
            />

            <Box
               sx={{
                  gridColumn: {
                     xs: 'auto',
                     sm: '1 / -1',
                  },
                  display: 'grid',
                  gridTemplateColumns: {
                     xs: '1fr',
                     sm: 'repeat(3, 1fr)',
                  },
                  gap: 2,
               }}
            >
               <Controller
                  name='cargoLengthCm'
                  control={control}
                  rules={{
                     required: 'Укажите длину',
                     validate: (value) =>
                        Number(value) > 0 || 'Длина должна быть больше 0',
                  }}
                  render={({ field }) => (
                     <TextField
                        {...field}
                        label='Длина, см'
                        fullWidth
                        size='small'
                        error={Boolean(errors.cargoLengthCm)}
                        helperText={errors.cargoLengthCm?.message}
                     />
                  )}
               />

               <Controller
                  name='cargoWidthCm'
                  control={control}
                  rules={{
                     required: 'Укажите ширину',
                     validate: (value) =>
                        Number(value) > 0 || 'Ширина должна быть больше 0',
                  }}
                  render={({ field }) => (
                     <TextField
                        {...field}
                        label='Ширина, см'
                        fullWidth
                        size='small'
                        error={Boolean(errors.cargoWidthCm)}
                        helperText={errors.cargoWidthCm?.message}
                     />
                  )}
               />

               <Controller
                  name='cargoHeightCm'
                  control={control}
                  rules={{
                     required: 'Укажите высоту',
                     validate: (value) =>
                        Number(value) > 0 || 'Высота должна быть больше 0',
                  }}
                  render={({ field }) => (
                     <TextField
                        {...field}
                        label='Высота, см'
                        fullWidth
                        size='small'
                        error={Boolean(errors.cargoHeightCm)}
                        helperText={errors.cargoHeightCm?.message}
                     />
                  )}
               />
            </Box>

            <Controller
               name='price'
               control={control}
               rules={{
                  required: 'Укажите цену',
                  validate: (value) =>
                     Number(value) >= 0 || 'Цена не может быть отрицательной',
               }}
               render={({ field }) => (
                  <TextField
                     {...field}
                     label='Цена'
                     fullWidth
                     size='small'
                     error={Boolean(errors.price)}
                     helperText={errors.price?.message}
                  />
               )}
            />

            <Controller
               name='currency'
               control={control}
               render={({ field }) => (
                  <TextField
                     {...field}
                     select
                     label='Валюта'
                     fullWidth
                     size='small'
                  >
                     <MenuItem value='KZT'>KZT</MenuItem>
                     <MenuItem value='USD'>USD</MenuItem>
                     <MenuItem value='RUB'>RUB</MenuItem>
                  </TextField>
               )}
            />

            <Controller
               name='vat'
               control={control}
               render={({ field }) => (
                  <FormControlLabel
                     control={
                        <Switch
                           checked={field.value}
                           onChange={(event) =>
                              field.onChange(event.target.checked)
                           }
                        />
                     }
                     label='С НДС'
                  />
               )}
            />

            <Controller
               name='comment'
               control={control}
               render={({ field }) => (
                  <TextField
                     {...field}
                     label='Комментарий'
                     fullWidth
                     multiline
                     minRows={3}
                     size='small'
                     sx={{
                        gridColumn: {
                           xs: 'auto',
                           sm: '1 / -1',
                        },
                     }}
                  />
               )}
            />
         </Box>
      </StepSection>
   );
}

CargoStep.propTypes = {
   control: PropTypes.object.isRequired,
   errors: PropTypes.object.isRequired,
};

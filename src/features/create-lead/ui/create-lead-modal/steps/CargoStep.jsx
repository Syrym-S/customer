import {
   Autocomplete,
   Box,
   CircularProgress,
   FormControlLabel,
   Switch,
   TextField,
} from '@mui/material';
import PropTypes from 'prop-types';
import { Controller } from 'react-hook-form';

import { StepSection } from '../components/StepSection';
import { useEffect, useMemo, useState } from 'react';
import { fetchCustomerCargoTypesApi, searchCustomerCargoTypesApi } from '../../../../../widgets/customer-leads/api/cargo-types.api';
import { fetchCustomerCurrenciesApi } from '../../../api/currencies.api';
import { CurrencyAutocomplete } from '../components/CurrencyAutocomplete';

export function CargoStep({ control, errors }) {
   const [cargoTypes, setCargoTypes] = useState([]);
   const [cargoTypesSearch, setCargoTypesSearch] = useState('');
   const [isCargoTypesLoading, setIsCargoTypesLoading] = useState(false);

   useEffect(() => {
      async function testCurrenciesRequest() {
         try {
            const response = await fetchCustomerCurrenciesApi();

            console.log('test currencies:', response);
         } catch (error) {
            console.error(
               'Не удалось загрузить валюты:',
               error.response?.data || error,
            );
         }
      }

      testCurrenciesRequest();
   }, []);

   useEffect(() => {
      let isCancelled = false;

      async function loadCargoTypes() {
         try {
            setIsCargoTypesLoading(true);

            const response = await fetchCustomerCargoTypesApi();

            if (!isCancelled) {
               setCargoTypes(response);
            }
         } catch (error) {
            console.error('Не удалось загрузить типы груза:', error);

            if (!isCancelled) {
               setCargoTypes([]);
            }
         } finally {
            if (!isCancelled) {
               setIsCargoTypesLoading(false);
            }
         }
      }

      loadCargoTypes();

      return () => {
         isCancelled = true;
      };
   }, []);

   useEffect(() => {
      const search = cargoTypesSearch.trim();

      if (!search) {
         return undefined;
      }

      let isCancelled = false;

      const timeoutId = window.setTimeout(async () => {
         try {
            setIsCargoTypesLoading(true);

            const response = await searchCustomerCargoTypesApi(search);

            if (!isCancelled) {
               setCargoTypes(response);
            }
         } catch (error) {
            console.error('Не удалось найти типы груза:', error);
         } finally {
            if (!isCancelled) {
               setIsCargoTypesLoading(false);
            }
         }
      }, 350);

      return () => {
         isCancelled = true;
         window.clearTimeout(timeoutId);
      };
   }, [cargoTypesSearch]);

   const cargoTypeOptions = useMemo(() => {
      const defaultOption = {
         id: '',
         name: 'Не указан',
      };

      const uniqueMap = new Map();

      [defaultOption, ...cargoTypes].forEach((item) => {
         if (!item?.name) {
            return;
         }

         uniqueMap.set(String(item.name).toLowerCase(), item);
      });

      return Array.from(uniqueMap.values());
   }, [cargoTypes]);

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
               render={({ field }) => {
                  const selectedOption =
                     cargoTypeOptions.find((option) => option.name === field.value) ||
                     cargoTypeOptions[0];

                  return (
                     <Autocomplete
                        options={cargoTypeOptions}
                        value={selectedOption}
                        loading={isCargoTypesLoading}
                        getOptionLabel={(option) => option?.name || ''}
                        isOptionEqualToValue={(option, value) =>
                           String(option?.id || option?.name) ===
                           String(value?.id || value?.name)
                        }
                        onInputChange={(_, value, reason) => {
                           if (reason === 'input') {
                              setCargoTypesSearch(value);
                           }
                        }}
                        onChange={(_, option) => {
                           field.onChange(option?.name || 'Не указан');
                        }}
                        renderInput={(params) => {
                           const inputProps = params.InputProps || {};

                           return (
                              <TextField
                                 {...params}
                                 label='Тип груза'
                                 fullWidth
                                 size='small'
                                 InputProps={{
                                    ...inputProps,
                                    endAdornment: (
                                       <>
                                          {isCargoTypesLoading && (
                                             <CircularProgress color='inherit' size={18} />
                                          )}

                                          {inputProps.endAdornment}
                                       </>
                                    ),
                                 }}
                              />
                           );
                        }}
                     />
                  );
               }}
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
                  <CurrencyAutocomplete
                     value={field.value || 'KZT'}
                     onChange={field.onChange}
                     label='Валюта'
                     fullWidth
                     size='small'
                  />
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

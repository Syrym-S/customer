import {
   Autocomplete,
   Box,
   CircularProgress,
   FormControl,
   FormControlLabel,
   InputLabel,
   MenuItem,
   Select,
   Switch,
   TextField,
   Button,
   IconButton,
   Stack,
   Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import PropTypes from 'prop-types';
import { Controller, useFieldArray, useWatch } from 'react-hook-form';

import { StepSection } from '../components/StepSection';
import { useEffect, useMemo, useState } from 'react';
import {
   fetchCustomerCargoTypesApi,
   searchCustomerCargoTypesApi,
} from '../../../../../widgets/customer-leads/api/cargo-types.api';
import { fetchCustomerCurrenciesApi } from '../../../api/currencies.api';
import { CurrencyAutocomplete } from '../components/CurrencyAutocomplete';
import { TnvedCodeAutocomplete } from '../../../../../widgets/customer-tnved/ui/TnvedCodeAutocomplete';
import { computeCargoVolumeM3 } from '../../../../../widgets/customer-leads/model/lead-transportation.helpers';
import { useLeadParamsOptions } from '../../../../../widgets/customer-leads/model/lead-params.store';

function createEmptyCargo() {
   return {
      name: '',
      description: '',
      weight_kg: '',
      type: 'Не указан',
      width_cm: '',
      height_cm: '',
      length_cm: '',
      volume_m3: '',
      isVolumeManual: false,
      cargo_price: '',
      tnved: null,
   };
}

export function CargoStep({ control, errors, setValue, getValues }) {
   const [cargoTypes, setCargoTypes] = useState([]);
   const [cargoTypesSearch, setCargoTypesSearch] = useState('');
   const [isCargoTypesLoading, setIsCargoTypesLoading] = useState(false);
   const transportationOptions = useLeadParamsOptions();
   const isInternational = useWatch({ control, name: 'is_international' });

   const { fields, append, remove } = useFieldArray({
      control,
      name: 'cargos',
   });

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

   function recalcCargoVolume(index) {
      const cargo = getValues(`cargos.${index}`) || {};

      if (cargo.isVolumeManual) {
         return;
      }

      const computedVolume = computeCargoVolumeM3(
         cargo.length_cm,
         cargo.width_cm,
         cargo.height_cm,
      );

      setValue(
         `cargos.${index}.volume_m3`,
         computedVolume === null ? '' : computedVolume,
      );
   }

   function handleDimensionFieldChange(index, onFieldChange) {
      return (event) => {
         onFieldChange(event);
         recalcCargoVolume(index);
      };
   }

   function handleVolumeFieldChange(index, onFieldChange) {
      return (event) => {
         onFieldChange(event);

         const isManual = event.target.value !== '';

         setValue(`cargos.${index}.isVolumeManual`, isManual);

         if (!isManual) {
            recalcCargoVolume(index);
         }
      };
   }

   return (
      <StepSection title="Грузы и оплата">
         <Stack spacing={2}>
            {fields.map((fieldItem, index) => {
               const cargoErrors = errors.cargos?.[index] || {};

               return (
                  <Box
                     key={fieldItem.id}
                     sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 3,
                        backgroundColor: 'grey.50',
                     }}
                  >
                     <Box
                        sx={{
                           display: 'flex',
                           justifyContent: 'space-between',
                           alignItems: 'center',
                           gap: 1,
                           mb: 2,
                        }}
                     >
                        <Typography fontWeight={600}>
                           Груз #{index + 1}
                        </Typography>

                        <IconButton
                           size="small"
                           color="error"
                           disabled={fields.length === 1}
                           onClick={() => remove(index)}
                        >
                           <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                     </Box>

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
                           name={`cargos.${index}.name`}
                           control={control}
                           rules={{
                              required: 'Укажите наименование груза',
                           }}
                           render={({ field }) => (
                              <TextField
                                 {...field}
                                 label="Наименование груза"
                                 fullWidth
                                 size="small"
                                 error={Boolean(cargoErrors.name)}
                                 helperText={cargoErrors.name?.message}
                              />
                           )}
                        />

                        <Controller
                           name={`cargos.${index}.type`}
                           control={control}
                           render={({ field }) => {
                              const selectedOption =
                                 cargoTypeOptions.find(
                                    (option) => option.name === field.value,
                                 ) || cargoTypeOptions[0];

                              return (
                                 <Autocomplete
                                    options={cargoTypeOptions}
                                    value={selectedOption}
                                    loading={isCargoTypesLoading}
                                    getOptionLabel={(option) =>
                                       option?.name || ''
                                    }
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
                                       field.onChange(
                                          option?.name || 'Не указан',
                                       );
                                    }}
                                    renderInput={(params) => {
                                       const inputProps =
                                          params.InputProps || {};

                                       return (
                                          <TextField
                                             {...params}
                                             label="Тип груза"
                                             fullWidth
                                             size="small"
                                             InputProps={{
                                                ...inputProps,
                                                endAdornment: (
                                                   <>
                                                      {isCargoTypesLoading && (
                                                         <CircularProgress
                                                            color="inherit"
                                                            size={18}
                                                         />
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
                           name={`cargos.${index}.weight_kg`}
                           control={control}
                           rules={{
                              validate: (value) => {
                                 if (
                                    value === '' ||
                                    value === null ||
                                    value === undefined
                                 ) {
                                    return true;
                                 }

                                 return (
                                    Number(value) > 0 ||
                                    'Вес должен быть больше 0'
                                 );
                              },
                           }}
                           render={({ field }) => (
                              <TextField
                                 {...field}
                                 label="Вес, кг"
                                 fullWidth
                                 size="small"
                                 error={Boolean(cargoErrors.weight_kg)}
                                 helperText={cargoErrors.weight_kg?.message}
                              />
                           )}
                        />

                        <Controller
                           name={`cargos.${index}.cargo_price`}
                           control={control}
                           rules={{
                              validate: (value) => {
                                 if (
                                    value === '' ||
                                    value === null ||
                                    value === undefined
                                 ) {
                                    return true;
                                 }

                                 return (
                                    Number(value) >= 0 ||
                                    'Цена груза не может быть отрицательной'
                                 );
                              },
                           }}
                           render={({ field }) => (
                              <TextField
                                 {...field}
                                 label="Цена груза"
                                 fullWidth
                                 size="small"
                              />
                           )}
                        />

                        <Box
                           sx={{
                              display: 'grid',
                              gridTemplateColumns: {
                                 xs: '1fr',
                                 sm: 'repeat(4, 1fr)',
                              },
                              gap: 2,
                              gridColumn: {
                                 xs: 'auto',
                                 sm: '1 / -1',
                              },
                           }}
                        >
                           <Controller
                              name={`cargos.${index}.length_cm`}
                              control={control}
                              render={({ field }) => (
                                 <TextField
                                    {...field}
                                    onChange={handleDimensionFieldChange(
                                       index,
                                       field.onChange,
                                    )}
                                    label="Длина, см"
                                    fullWidth
                                    size="small"
                                 />
                              )}
                           />

                           <Controller
                              name={`cargos.${index}.width_cm`}
                              control={control}
                              render={({ field }) => (
                                 <TextField
                                    {...field}
                                    onChange={handleDimensionFieldChange(
                                       index,
                                       field.onChange,
                                    )}
                                    label="Ширина, см"
                                    fullWidth
                                    size="small"
                                 />
                              )}
                           />

                           <Controller
                              name={`cargos.${index}.height_cm`}
                              control={control}
                              render={({ field }) => (
                                 <TextField
                                    {...field}
                                    onChange={handleDimensionFieldChange(
                                       index,
                                       field.onChange,
                                    )}
                                    label="Высота, см"
                                    fullWidth
                                    size="small"
                                 />
                              )}
                           />

                           <Controller
                              name={`cargos.${index}.volume_m3`}
                              control={control}
                              render={({ field }) => (
                                 <TextField
                                    {...field}
                                    onChange={handleVolumeFieldChange(
                                       index,
                                       field.onChange,
                                    )}
                                    label="Объем, м³"
                                    fullWidth
                                    size="small"
                                 />
                              )}
                           />
                        </Box>

                        <Controller
                           name={`cargos.${index}.description`}
                           control={control}
                           render={({ field }) => (
                              <TextField
                                 {...field}
                                 label="Описание груза"
                                 fullWidth
                                 multiline
                                 minRows={2}
                                 size="small"
                                 sx={{
                                    gridColumn: {
                                       xs: 'auto',
                                       sm: '1 / -1',
                                    },
                                 }}
                              />
                           )}
                        />

                        {isInternational && (
                           <Controller
                              name={`cargos.${index}.tnved`}
                              control={control}
                              rules={{
                                 validate: (value) =>
                                    !isInternational ||
                                    Boolean(value?.code) ||
                                    'Укажите код ТН ВЭД',
                              }}
                              render={({ field }) => (
                                 <Box
                                    sx={{
                                       gridColumn: {
                                          xs: 'auto',
                                          sm: '1 / -1',
                                       },
                                    }}
                                 >
                                    <TnvedCodeAutocomplete
                                       value={field.value}
                                       onChange={field.onChange}
                                       label="Код ТН ВЭД"
                                       error={Boolean(cargoErrors.tnved)}
                                       helperText={cargoErrors.tnved?.message}
                                    />
                                 </Box>
                              )}
                           />
                        )}
                     </Box>
                  </Box>
               );
            })}

            <Button
               type="button"
               variant="outlined"
               startIcon={<AddRoundedIcon />}
               onClick={() => append(createEmptyCargo())}
               sx={{ alignSelf: 'flex-start' }}
            >
               Добавить груз
            </Button>

            <Box
               sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                     xs: '1fr',
                     sm: 'repeat(2, 1fr)',
                     md: 'repeat(4, 1fr)',
                  },
                  gap: 2,
               }}
            >
               <Controller
                  name="loadingType"
                  control={control}
                  render={({ field }) => (
                     <FormControl fullWidth size="small">
                        <InputLabel id="loading-type-label">
                           Тип погрузки
                        </InputLabel>
                        <Select
                           {...field}
                           labelId="loading-type-label"
                           label="Тип погрузки"
                           value={field.value || ''}
                        >
                           <MenuItem value="">Не указан</MenuItem>
                           {transportationOptions.loadingType.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                 {option.label}
                              </MenuItem>
                           ))}
                        </Select>
                     </FormControl>
                  )}
               />

               <Controller
                  name="packagingType"
                  control={control}
                  render={({ field }) => (
                     <FormControl fullWidth size="small">
                        <InputLabel id="packaging-type-label">
                           Вид упаковки
                        </InputLabel>
                        <Select
                           {...field}
                           labelId="packaging-type-label"
                           label="Вид упаковки"
                           value={field.value || ''}
                        >
                           <MenuItem value="">Не указан</MenuItem>
                           {transportationOptions.packagingType.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                 {option.label}
                              </MenuItem>
                           ))}
                        </Select>
                     </FormControl>
                  )}
               />

               <Controller
                  name="compositionType"
                  control={control}
                  render={({ field }) => (
                     <FormControl fullWidth size="small">
                        <InputLabel id="composition-type-label">
                           Тип состава
                        </InputLabel>
                        <Select
                           {...field}
                           labelId="composition-type-label"
                           label="Тип состава"
                           value={field.value || ''}
                        >
                           <MenuItem value="">Не указан</MenuItem>
                           {transportationOptions.compositionType.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                 {option.label}
                              </MenuItem>
                           ))}
                        </Select>
                     </FormControl>
                  )}
               />

               <Controller
                  name="transportType"
                  control={control}
                  render={({ field }) => (
                     <FormControl fullWidth size="small">
                        <InputLabel id="transport-type-label">
                           Тип транспорта
                        </InputLabel>
                        <Select
                           {...field}
                           labelId="transport-type-label"
                           label="Тип транспорта"
                           value={field.value || ''}
                        >
                           <MenuItem value="">Не указан</MenuItem>
                           {transportationOptions.transportType.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                 {option.label}
                              </MenuItem>
                           ))}
                        </Select>
                     </FormControl>
                  )}
               />
            </Box>

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
                  name="price"
                  control={control}
                  rules={{
                     validate: (value) => {
                        if (
                           value === '' ||
                           value === null ||
                           value === undefined
                        ) {
                           return true;
                        }

                        return (
                           Number(value) >= 0 ||
                           'Цена не может быть отрицательной'
                        );
                     },
                  }}
                  render={({ field }) => (
                     <TextField
                        {...field}
                        label="Цена исполнения"
                        fullWidth
                        size="small"
                        error={Boolean(errors.price)}
                        helperText={errors.price?.message}
                     />
                  )}
               />

               <Controller
                  name="currency"
                  control={control}
                  render={({ field }) => (
                     <CurrencyAutocomplete
                        value={field.value || 'KZT'}
                        onChange={field.onChange}
                        label="Валюта"
                        fullWidth
                        size="small"
                     />
                  )}
               />

               <Controller
                  name="vat"
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
                        label="С НДС"
                     />
                  )}
               />
            </Box>
         </Stack>
      </StepSection>
   );
}

CargoStep.propTypes = {
   control: PropTypes.object.isRequired,
   errors: PropTypes.object.isRequired,
   setValue: PropTypes.func.isRequired,
   getValues: PropTypes.func.isRequired,
};

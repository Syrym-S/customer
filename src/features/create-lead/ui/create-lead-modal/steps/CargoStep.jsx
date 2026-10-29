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
import i18n from '../../../../../shared/i18n';
import { useTranslation } from "react-i18next";
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
import { NumericTextField } from '../../../../../shared/ui/NumericTextField';

function createEmptyCargo() {
   return {
      name: '',
      description: '',
      weight_kg: '',
      type: i18n.t("common.empty.notSpecifiedM"),
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
   const { t } = useTranslation();

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
         name: t("common.empty.notSpecifiedM"),
      };

      const uniqueMap = new Map();

      [defaultOption, ...cargoTypes].forEach((item) => {
         if (!item?.name) {
            return;
         }

         uniqueMap.set(String(item.name).toLowerCase(), item);
      });

      return Array.from(uniqueMap.values());
   }, [cargoTypes, t]);

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
      return (nextValue) => {
         onFieldChange(nextValue);
         recalcCargoVolume(index);
      };
   }

   function handleVolumeFieldChange(index, onFieldChange) {
      return (nextValue) => {
         onFieldChange(nextValue);

         const isManual = nextValue !== '';

         setValue(`cargos.${index}.isVolumeManual`, isManual);

         if (!isManual) {
            recalcCargoVolume(index);
         }
      };
   }

   return (
      <StepSection title={t("createLead.steps.cargo")}>
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
                           {t("leads.cargo.itemNumber", { index: index + 1 })}
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
                              required: t("createLead.cargo.validation.nameRequired"),
                           }}
                           render={({ field }) => (
                              <TextField
                                 {...field}
                                 label={t("common.fields.cargoName")}
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
                                          option?.name || t("common.empty.notSpecifiedM"),
                                       );
                                    }}
                                    renderInput={(params) => {
                                       const inputProps =
                                          params.InputProps || {};

                                       return (
                                          <TextField
                                             {...params}
                                             label={t("common.fields.cargoType")}
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
                                    t("createLead.cargo.validation.weightPositive")
                                 );
                              },
                           }}
                           render={({ field }) => (
                              <NumericTextField
                                 name={field.name}
                                 value={field.value}
                                 onChange={field.onChange}
                                 onBlur={field.onBlur}
                                 inputRef={field.ref}
                                 decimals={3}
                                 label={t("common.fields.weightKg")}
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
                                    t("createLead.cargo.validation.cargoPriceNegative")
                                 );
                              },
                           }}
                           render={({ field }) => (
                              <NumericTextField
                                 name={field.name}
                                 value={field.value}
                                 onChange={field.onChange}
                                 onBlur={field.onBlur}
                                 inputRef={field.ref}
                                 decimals={2}
                                 label={t("common.fields.cargoPrice")}
                                 fullWidth
                                 size="small"
                                 error={Boolean(cargoErrors.cargo_price)}
                                 helperText={cargoErrors.cargo_price?.message}
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
                                       t("createLead.cargo.validation.lengthPositive")
                                    );
                                 },
                              }}
                              render={({ field }) => (
                                 <NumericTextField
                                    name={field.name}
                                    value={field.value}
                                    onBlur={field.onBlur}
                                    inputRef={field.ref}
                                    decimals={0}
                                    onChange={handleDimensionFieldChange(
                                       index,
                                       field.onChange,
                                    )}
                                    label={t("common.fields.lengthCm")}
                                    fullWidth
                                    size="small"
                                    error={Boolean(cargoErrors.length_cm)}
                                    helperText={cargoErrors.length_cm?.message}
                                 />
                              )}
                           />

                           <Controller
                              name={`cargos.${index}.width_cm`}
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
                                       t("createLead.cargo.validation.widthPositive")
                                    );
                                 },
                              }}
                              render={({ field }) => (
                                 <NumericTextField
                                    name={field.name}
                                    value={field.value}
                                    onBlur={field.onBlur}
                                    inputRef={field.ref}
                                    decimals={0}
                                    onChange={handleDimensionFieldChange(
                                       index,
                                       field.onChange,
                                    )}
                                    label={t("common.fields.widthCm")}
                                    fullWidth
                                    size="small"
                                    error={Boolean(cargoErrors.width_cm)}
                                    helperText={cargoErrors.width_cm?.message}
                                 />
                              )}
                           />

                           <Controller
                              name={`cargos.${index}.height_cm`}
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
                                       t("createLead.cargo.validation.heightPositive")
                                    );
                                 },
                              }}
                              render={({ field }) => (
                                 <NumericTextField
                                    name={field.name}
                                    value={field.value}
                                    onBlur={field.onBlur}
                                    inputRef={field.ref}
                                    decimals={0}
                                    onChange={handleDimensionFieldChange(
                                       index,
                                       field.onChange,
                                    )}
                                    label={t("common.fields.heightCm")}
                                    fullWidth
                                    size="small"
                                    error={Boolean(cargoErrors.height_cm)}
                                    helperText={cargoErrors.height_cm?.message}
                                 />
                              )}
                           />

                           <Controller
                              name={`cargos.${index}.volume_m3`}
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
                                       t("createLead.cargo.validation.volumePositive")
                                    );
                                 },
                              }}
                              render={({ field }) => (
                                 <NumericTextField
                                    name={field.name}
                                    value={field.value}
                                    onBlur={field.onBlur}
                                    inputRef={field.ref}
                                    decimals={3}
                                    onChange={handleVolumeFieldChange(
                                       index,
                                       field.onChange,
                                    )}
                                    label={t("common.fields.volumeM3")}
                                    fullWidth
                                    size="small"
                                    error={Boolean(cargoErrors.volume_m3)}
                                    helperText={cargoErrors.volume_m3?.message}
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
                                 label={t("createLead.cargo.description")}
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
                                    t("createLead.cargo.validation.tnvedRequired"),
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
                                       label={t("common.fields.tnvedCode")}
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
               {t("leads.cargo.add")}
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
                           {t("common.fields.loadingType")}
                        </InputLabel>
                        <Select
                           {...field}
                           labelId="loading-type-label"
                           label={t("common.fields.loadingType")}
                           value={field.value || ''}
                        >
                           <MenuItem value="">{t("common.empty.notSpecifiedM")}</MenuItem>
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
                           {t("common.fields.packagingType")}
                        </InputLabel>
                        <Select
                           {...field}
                           labelId="packaging-type-label"
                           label={t("common.fields.packagingType")}
                           value={field.value || ''}
                        >
                           <MenuItem value="">{t("common.empty.notSpecifiedM")}</MenuItem>
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
                           {t("common.fields.bodyType")}
                        </InputLabel>
                        <Select
                           {...field}
                           labelId="composition-type-label"
                           label={t("common.fields.bodyType")}
                           value={field.value || ''}
                        >
                           <MenuItem value="">{t("common.empty.notSpecifiedM")}</MenuItem>
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
                           {t("common.fields.transportType")}
                        </InputLabel>
                        <Select
                           {...field}
                           labelId="transport-type-label"
                           label={t("common.fields.transportType")}
                           value={field.value || ''}
                        >
                           <MenuItem value="">{t("common.empty.notSpecifiedM")}</MenuItem>
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
                           t("createLead.cargo.validation.priceNegative")
                        );
                     },
                  }}
                  render={({ field }) => (
                     <NumericTextField
                        name={field.name}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        inputRef={field.ref}
                        decimals={2}
                        label={t("common.fields.executionPrice")}
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
                        label={t("common.fields.currency")}
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
                        label={t("createLead.cargo.withVat")}
                     />
                  )}
               />

               <Controller
                  name="gracePeriodDays"
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

                        const number = Number(value);

                        return (
                           (Number.isInteger(number) &&
                              number > 0 &&
                              number < 365) ||
                           t("createLead.cargo.validation.gracePeriodRange")
                        );
                     },
                  }}
                  render={({ field }) => (
                     <NumericTextField
                        name={field.name}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        inputRef={field.ref}
                        decimals={0}
                        label={t("common.fields.gracePeriodDays")}
                        fullWidth
                        size="small"
                        error={Boolean(errors.gracePeriodDays)}
                        helperText={errors.gracePeriodDays?.message}
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

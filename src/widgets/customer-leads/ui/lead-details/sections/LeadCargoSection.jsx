import {
   Autocomplete,
   Box,
   Button,
   CircularProgress,
   IconButton,
   MenuItem,
   Stack,
   TextField,
   Typography,
} from '@mui/material';
import PropTypes from 'prop-types';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';

import { DetailSection } from '../components/DetailSection';
import { InfoBadge } from '../components/InfoBadge';
import { useEffect, useMemo, useState } from 'react';
import {
   fetchCustomerCargoTypesApi,
   searchCustomerCargoTypesApi,
} from '../../../api/cargo-types.api';
import { CurrencyAutocomplete } from '../../../../../features/create-lead/ui/create-lead-modal/components/CurrencyAutocomplete';

function createEmptyLeadCargo() {
   return {
      name: '',
      description: '',
      weight_kg: '',
      cargo_price: '',
      type: 'Не указан',
      width_cm: '',
      height_cm: '',
      length_cm: '',
   };
}

function getLeadCargos(lead) {
   return Array.isArray(lead.cargos) ? lead.cargos : [];
}

function getEditCargos(editForm) {
   if (Array.isArray(editForm.cargos) && editForm.cargos.length) {
      return editForm.cargos;
   }

   return [createEmptyLeadCargo()];
}

function hasValue(value) {
   return value !== null && value !== undefined && value !== '';
}

function getCargoWeightDisplay(cargo) {
   return hasValue(cargo.weight_kg) ? `${cargo.weight_kg} кг` : 'Не указано';
}

function getCargoDimensionsDisplay(cargo) {
   const length = cargo.length_cm;
   const width = cargo.width_cm;
   const height = cargo.height_cm;

   if (!hasValue(length) && !hasValue(width) && !hasValue(height)) {
      return 'Не указано';
   }

   return `${length || '—'} × ${width || '—'} × ${height || '—'} см`;
}

export function LeadCargoSection({
   lead,
   isEditing,
   editForm,
   onEditChange,
   onDeleteCargo,
   deletingCargoIndex = null,
}) {
   const [cargoTypes, setCargoTypes] = useState([]);
   const [cargoTypesSearch, setCargoTypesSearch] = useState('');
   const [isCargoTypesLoading, setIsCargoTypesLoading] = useState(false);

   const leadCargos = getLeadCargos(lead);
   const editCargos = getEditCargos(editForm);

   const isForwarderCreatedLead = lead?.created_by === 'forwarder';

   useEffect(() => {
      if (!isEditing) {
         return undefined;
      }

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
   }, [isEditing]);

   useEffect(() => {
      if (!isEditing) {
         return undefined;
      }

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
   }, [cargoTypesSearch, isEditing]);

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

   function handleCargoChange(index, key, value) {
      const nextCargos = editCargos.map((cargo, cargoIndex) =>
         cargoIndex === index
            ? {
                 ...cargo,
                 [key]: value,
              }
            : cargo,
      );

      onEditChange('cargos', nextCargos);
   }

   function handleAddCargo() {
      onEditChange('cargos', [...editCargos, createEmptyLeadCargo()]);
   }

   function handleRemoveCargo(index) {
      const nextCargos = editCargos.filter(
         (_, cargoIndex) => cargoIndex !== index,
      );

      onEditChange(
         'cargos',
         nextCargos.length ? nextCargos : [createEmptyLeadCargo()],
      );
   }

   return (
      <DetailSection icon={<LocalShippingOutlinedIcon />} title="Грузы">
         <Stack spacing={2}>
            {isEditing ? (
               <>
                  {editCargos.map((cargo, index) => (
                     <Box
                        key={index}
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
                              alignItems: 'center',
                              justifyContent: 'space-between',
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
                              disabled={editCargos.length === 1}
                              onClick={() => handleRemoveCargo(index)}
                           >
                              <DeleteOutlineRoundedIcon fontSize="small" />
                           </IconButton>
                        </Box>

                        <Box
                           sx={{
                              display: 'grid',
                              gridTemplateColumns: {
                                 xs: '1fr',
                                 sm: 'repeat(2, minmax(0, 1fr))',
                              },
                              gap: 1,
                           }}
                        >
                           <TextField
                              label="Наименование груза"
                              value={cargo.name || ''}
                              onChange={(event) =>
                                 handleCargoChange(
                                    index,
                                    'name',
                                    event.target.value,
                                 )
                              }
                              fullWidth
                              size="small"
                           />

                           <Autocomplete
                              options={cargoTypeOptions}
                              value={
                                 cargoTypeOptions.find(
                                    (option) => option.name === cargo.type,
                                 ) || cargoTypeOptions[0]
                              }
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
                                 handleCargoChange(
                                    index,
                                    'type',
                                    option?.name || 'Не указан',
                                 );
                              }}
                              renderInput={(params) => {
                                 const inputProps = params.InputProps || {};

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

                           <TextField
                              label="Вес, кг"
                              value={cargo.weight_kg || ''}
                              onChange={(event) =>
                                 handleCargoChange(
                                    index,
                                    'weight_kg',
                                    event.target.value,
                                 )
                              }
                              fullWidth
                              size="small"
                           />

                           <TextField
                              label="Цена груза"
                              value={cargo.cargo_price || ''}
                              onChange={(event) =>
                                 handleCargoChange(
                                    index,
                                    'cargo_price',
                                    event.target.value,
                                 )
                              }
                              fullWidth
                              size="small"
                           />

                           <Box
                              sx={{
                                 display: 'grid',
                                 gridTemplateColumns: {
                                    xs: '1fr',
                                    sm: 'repeat(3, 1fr)',
                                 },
                                 gap: 1,
                                 gridColumn: {
                                    xs: 'auto',
                                    sm: '1 / -1',
                                 },
                              }}
                           >
                              <TextField
                                 label="Длина, см"
                                 value={cargo.length_cm || ''}
                                 onChange={(event) =>
                                    handleCargoChange(
                                       index,
                                       'length_cm',
                                       event.target.value,
                                    )
                                 }
                                 fullWidth
                                 size="small"
                              />

                              <TextField
                                 label="Ширина, см"
                                 value={cargo.width_cm || ''}
                                 onChange={(event) =>
                                    handleCargoChange(
                                       index,
                                       'width_cm',
                                       event.target.value,
                                    )
                                 }
                                 fullWidth
                                 size="small"
                              />

                              <TextField
                                 label="Высота, см"
                                 value={cargo.height_cm || ''}
                                 onChange={(event) =>
                                    handleCargoChange(
                                       index,
                                       'height_cm',
                                       event.target.value,
                                    )
                                 }
                                 fullWidth
                                 size="small"
                              />
                           </Box>

                           <TextField
                              label="Описание"
                              value={cargo.description || ''}
                              onChange={(event) =>
                                 handleCargoChange(
                                    index,
                                    'description',
                                    event.target.value,
                                 )
                              }
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
                        </Box>
                     </Box>
                  ))}

                  <Button
                     type="button"
                     variant="outlined"
                     startIcon={<AddRoundedIcon />}
                     onClick={handleAddCargo}
                     sx={{ alignSelf: 'flex-start' }}
                  >
                     Добавить груз
                  </Button>
               </>
            ) : (
               <>
                  {leadCargos.length ? (
                     leadCargos.map((cargo, index) => (
                        <Box
                           key={cargo.id || index}
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
                                 alignItems: 'center',
                                 justifyContent: 'space-between',
                                 gap: 1,
                                 mb: 1,
                              }}
                           >
                              <Typography fontWeight={600}>
                                 Груз #{index + 1}
                              </Typography>

                              <IconButton
                                 size="small"
                                 color="error"
                                 disabled={deletingCargoIndex === index}
                                 onClick={() => onDeleteCargo?.(index)}
                              >
                                 {deletingCargoIndex === index ? (
                                    <CircularProgress
                                       size={18}
                                       color="inherit"
                                    />
                                 ) : (
                                    <DeleteOutlineRoundedIcon fontSize="small" />
                                 )}
                              </IconButton>
                           </Box>

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
                              <InfoBadge
                                 label="Наименование"
                                 value={cargo.name || 'Не указано'}
                              />

                              <InfoBadge
                                 label="Тип"
                                 value={cargo.type || 'Не указано'}
                              />

                              <InfoBadge
                                 label="Вес"
                                 value={getCargoWeightDisplay(cargo)}
                              />

                              <InfoBadge
                                 label="Цена груза"
                                 value={
                                    hasValue(cargo.cargo_price)
                                       ? `${cargo.cargo_price} ${lead.currency || ''}`.trim()
                                       : 'Не указано'
                                 }
                              />

                              <InfoBadge
                                 label="Размеры"
                                 value={getCargoDimensionsDisplay(cargo)}
                              />
                           </Box>

                           <InfoBadge
                              label="Описание"
                              value={cargo.description || 'Не указано'}
                              fullWidth
                              sx={{ mt: 1 }}
                           />
                        </Box>
                     ))
                  ) : (
                     <InfoBadge label="Груз" value="Не указан" fullWidth />
                  )}
               </>
            )}

            <Box
               sx={{
                  display: 'grid',
                  gridTemplateColumns: isEditing
                     ? {
                          xs: '1fr',
                          sm: 'minmax(0, 1fr) minmax(160px, 220px) minmax(120px, 160px)',
                       }
                     : {
                          xs: '1fr 1fr',
                          sm: 'repeat(3, 1fr)',
                       },
                  gap: 1,
               }}
            >
               {isEditing ? (
                  <>
                     <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1}
                        sx={{
                           minWidth: 0,
                           width: '100%',
                        }}
                     >
                        <TextField
                           name="price"
                           label="Цена исполнения"
                           value={editForm.price ?? ''}
                           onChange={onEditChange}
                           disabled={isForwarderCreatedLead}
                           helperText={
                              isForwarderCreatedLead
                                 ? 'Цена задана экспедитором'
                                 : ''
                           }
                           fullWidth
                           size="small"
                           sx={{
                              minWidth: 0,
                              flex: '1 1 auto',
                           }}
                        />

                        <CurrencyAutocomplete
                           value={editForm.currency || 'KZT'}
                           onChange={(nextCurrency) => {
                              onEditChange('currency', nextCurrency);
                           }}
                           label="Валюта"
                           size="small"
                           disabled={isForwarderCreatedLead}
                           sx={{
                              minWidth: {
                                 xs: '100%',
                                 sm: 145,
                                 md: 155,
                              },
                              flex: {
                                 xs: '1 1 auto',
                                 sm: '0 0 155px',
                              },
                           }}
                        />
                     </Stack>

                     <TextField
                        name="vat"
                        label="НДС"
                        value={editForm.vat || 'без НДС'}
                        onChange={onEditChange}
                        fullWidth
                        size="small"
                        select
                        sx={{ minWidth: 0 }}
                     >
                        <MenuItem value="с НДС">с НДС</MenuItem>
                        <MenuItem value="без НДС">без НДС</MenuItem>
                     </TextField>
                  </>
               ) : (
                  <>
                     <InfoBadge
                        label="Цена исполнения"
                        value={
                           hasValue(lead.price)
                              ? `${lead.price} ${lead.currency}`
                              : 'Не указано'
                        }
                        accent
                     />

                     <InfoBadge label="НДС" value={lead.vat || 'Не указано'} />

                     <InfoBadge
                        label="Количество грузов"
                        value={leadCargos.length || 'Не указано'}
                     />
                  </>
               )}
            </Box>
         </Stack>
      </DetailSection>
   );
}

LeadCargoSection.propTypes = {
   lead: PropTypes.object.isRequired,
   isEditing: PropTypes.bool.isRequired,
   editForm: PropTypes.object.isRequired,
   onEditChange: PropTypes.func.isRequired,
   onDeleteCargo: PropTypes.func,
   deletingCargoIndex: PropTypes.number,
};

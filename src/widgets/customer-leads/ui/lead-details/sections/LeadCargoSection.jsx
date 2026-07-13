import { Autocomplete, Box, CircularProgress, MenuItem, Stack, TextField } from '@mui/material';
import PropTypes from 'prop-types';

import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';

import { DetailSection } from '../components/DetailSection';
import { InfoBadge } from '../components/InfoBadge';
import { useEffect, useMemo, useState } from 'react';
import { fetchCustomerCargoTypesApi, searchCustomerCargoTypesApi } from '../../../api/cargo-types.api';

export function LeadCargoSection({ lead, isEditing, editForm, onEditChange }) {
   const [cargoTypes, setCargoTypes] = useState([]);
   const [cargoTypesSearch, setCargoTypesSearch] = useState('');
   const [isCargoTypesLoading, setIsCargoTypesLoading] = useState(false);

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
               <Autocomplete
                  options={cargoTypeOptions}
                  value={
                     cargoTypeOptions.find(
                        (option) => option.name === editForm.cargoType,
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
                     onEditChange('cargoType', option?.name || 'Не указан');
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

import { useEffect, useMemo, useState } from 'react';
import {
   Autocomplete,
   Box,
   CircularProgress,
   TextField,
   Typography,
} from '@mui/material';
import {
   fetchCustomerCurrenciesApi,
   searchCustomerCurrenciesApi,
} from '../../../api/currencies.api';

function getCurrencyLabel(option) {
   return option?.code || '';
}

export function CurrencyAutocomplete({
   value,
   onChange,
   label = 'Валюта',
   disabled = false,
   size = 'small',
   fullWidth = true,
   sx,
}) {
   const [currencies, setCurrencies] = useState([]);
   const [currencySearch, setCurrencySearch] = useState('');
   const [isLoading, setIsLoading] = useState(false);

   useEffect(() => {
      let isCancelled = false;

      async function loadCurrencies() {
         try {
            setIsLoading(true);

            const response = await fetchCustomerCurrenciesApi();

            if (!isCancelled) {
               setCurrencies(response);
            }
         } catch (error) {
            console.error('Не удалось загрузить валюты:', error);

            if (!isCancelled) {
               setCurrencies([]);
            }
         } finally {
            if (!isCancelled) {
               setIsLoading(false);
            }
         }
      }

      loadCurrencies();

      return () => {
         isCancelled = true;
      };
   }, []);

   useEffect(() => {
      const search = currencySearch.trim();

      if (!search) {
         return undefined;
      }

      let isCancelled = false;

      const timeoutId = window.setTimeout(async () => {
         try {
            setIsLoading(true);

            const response = await searchCustomerCurrenciesApi(search);

            if (!isCancelled) {
               setCurrencies(response);
            }
         } catch (error) {
            console.error('Не удалось найти валюты:', error);
         } finally {
            if (!isCancelled) {
               setIsLoading(false);
            }
         }
      }, 350);

      return () => {
         isCancelled = true;
         window.clearTimeout(timeoutId);
      };
   }, [currencySearch]);

   const currencyOptions = useMemo(() => {
      const uniqueMap = new Map();

      currencies.forEach((item) => {
         if (!item?.code) {
            return;
         }

         uniqueMap.set(String(item.code).toUpperCase(), item);
      });

      return Array.from(uniqueMap.values());
   }, [currencies]);

   const selectedOption =
      currencyOptions.find(
         (option) =>
            String(option.code).toUpperCase() === String(value).toUpperCase(),
      ) || null;

   return (
      <Autocomplete
         disabled={disabled}
         options={currencyOptions}
         value={selectedOption}
         loading={isLoading}
         getOptionLabel={getCurrencyLabel}
         isOptionEqualToValue={(option, selectedValue) =>
            option?.code === selectedValue?.code
         }
         onInputChange={(_, nextValue, reason) => {
            if (reason === 'input') {
               setCurrencySearch(nextValue);
            }
         }}
         onChange={(_, option) => {
            onChange(option?.code || '');
         }}
         renderInput={(params) => {
            const inputProps = params.InputProps || {};

            return (
               <TextField
                  {...params}
                  label={label}
                  fullWidth={fullWidth}
                  size={size}
                  sx={sx}
                  InputProps={{
                     ...inputProps,
                     endAdornment: (
                        <>
                           {isLoading && (
                              <CircularProgress color="inherit" size={18} />
                           )}

                           {inputProps.endAdornment}
                        </>
                     ),
                  }}
               />
            );
         }}
         renderOption={(optionProps, option) => {
            const { key, ...listItemProps } = optionProps;

            return (
               <Box
                  key={key}
                  component="li"
                  {...listItemProps}
                  sx={{
                     display: 'flex',
                     flexDirection: 'column',
                     alignItems: 'flex-start',
                  }}
               >
                  <Typography fontWeight={600}>{option.code}</Typography>

                  <Typography fontSize={12} color="text.secondary">
                     {option.fullname}
                  </Typography>
               </Box>
            );
         }}
      />
   );
}

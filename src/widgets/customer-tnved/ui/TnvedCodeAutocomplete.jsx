import { useEffect, useMemo, useState } from 'react';
import {
   Autocomplete,
   Box,
   CircularProgress,
   TextField,
   Typography,
} from '@mui/material';
import PropTypes from 'prop-types';

import { searchTnvedCodes } from '../api/tnved.repository';

export function TnvedCodeAutocomplete({
   value,
   onChange,
   label = 'Код ТН ВЭД',
   error = false,
   helperText = '',
   size = 'small',
   fullWidth = true,
}) {
   const [options, setOptions] = useState([]);
   const [search, setSearch] = useState('');
   const [isLoading, setIsLoading] = useState(false);

   useEffect(() => {
      let isCancelled = false;

      async function loadOptions() {
         try {
            setIsLoading(true);

            const response = await searchTnvedCodes(search.trim());

            if (!isCancelled) {
               setOptions(response);
            }
         } finally {
            if (!isCancelled) {
               setIsLoading(false);
            }
         }
      }

      const timeoutId = window.setTimeout(loadOptions, 300);

      return () => {
         isCancelled = true;
         window.clearTimeout(timeoutId);
      };
   }, [search]);

   const selectedOption = useMemo(() => {
      if (!value?.code) {
         return null;
      }

      return options.find((option) => option.code === value.code) || value;
   }, [value, options]);

   return (
      <Autocomplete
         options={options}
         value={selectedOption}
         loading={isLoading}
         getOptionLabel={(option) =>
            option?.code ? `${option.code} — ${option.name}` : ''
         }
         isOptionEqualToValue={(option, selected) =>
            option?.code === selected?.code
         }
         onInputChange={(_, nextValue, reason) => {
            if (reason === 'input') {
               setSearch(nextValue);
            }
         }}
         onChange={(_, option) => {
            onChange(option ? { code: option.code, name: option.name } : null);
         }}
         noOptionsText="Код не найден"
         renderOption={(optionProps, option) => {
            const { key, ...listItemProps } = optionProps;

            return (
               <li key={key} {...listItemProps}>
                  <Box sx={{ width: '100%', textAlign: 'left' }}>
                     <Typography fontWeight={600}>{option.code}</Typography>
                     <Typography fontSize={12} color="text.secondary">
                        {option.name}
                     </Typography>
                  </Box>
               </li>
            );
         }}
         renderInput={(params) => {
            const inputProps = params.InputProps || {};

            return (
               <TextField
                  {...params}
                  label={label}
                  fullWidth={fullWidth}
                  size={size}
                  error={error}
                  helperText={helperText}
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
      />
   );
}

TnvedCodeAutocomplete.propTypes = {
   value: PropTypes.shape({
      code: PropTypes.string,
      name: PropTypes.string,
   }),
   onChange: PropTypes.func.isRequired,
   label: PropTypes.string,
   error: PropTypes.bool,
   helperText: PropTypes.string,
   size: PropTypes.string,
   fullWidth: PropTypes.bool,
};

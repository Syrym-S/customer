import { Autocomplete, CircularProgress, TextField } from '@mui/material';

export function RouteAddressAutocomplete({
   label,
   value,
   inputValue,
   options,
   isLoading,
   onInputChange,
   onSelect,
}) {
   return (
      <Autocomplete
         freeSolo
         value={value || ''}
         inputValue={inputValue || value || ''}
         options={options}
         loading={isLoading}
         filterOptions={(items) => items}
         getOptionLabel={(option) => {
            if (typeof option === 'string') {
               return option;
            }

            return option?.label || option?.address || '';
         }}
         isOptionEqualToValue={(option, selectedValue) => {
            if (typeof selectedValue === 'string') {
               return (
                  option?.label === selectedValue ||
                  option?.address === selectedValue
               );
            }

            return option?.address === selectedValue?.address;
         }}
         onInputChange={(_, newInputValue, reason) => {
            if (reason === 'reset') {
               return;
            }

            onInputChange(newInputValue);
         }}
         onChange={(_, selectedOption) => {
            if (!selectedOption || typeof selectedOption === 'string') {
               return;
            }

            onSelect(selectedOption);
         }}
         noOptionsText={
            inputValue.trim().length < 2
               ? 'Введите минимум 2 символа'
               : 'Адрес не найден'
         }
         loadingText="Поиск адреса..."
         renderInput={(params) => {
            const inputProps = params.InputProps || {};

            return (
               <TextField
                  {...params}
                  label={label}
                  fullWidth
                  size="small"
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

import { TextField } from '@mui/material';
import PropTypes from 'prop-types';

import { sanitizeDecimalInput } from '../helpers/numeric-input.helpers';

export function NumericTextField({
   value,
   onChange,
   onBlur,
   decimals = 2,
   inputProps,
   ...restProps
}) {
   function handleChange(event) {
      const nextValue = sanitizeDecimalInput(event.target.value, decimals);

      onChange?.(nextValue, event);
   }

   return (
      <TextField
         {...restProps}
         value={value ?? ''}
         onChange={handleChange}
         onBlur={onBlur}
         inputProps={{
            inputMode: decimals > 0 ? 'decimal' : 'numeric',
            autoComplete: 'off',
            ...inputProps,
         }}
      />
   );
}

NumericTextField.propTypes = {
   value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
   onChange: PropTypes.func,
   onBlur: PropTypes.func,
   decimals: PropTypes.number,
   inputProps: PropTypes.object,
};

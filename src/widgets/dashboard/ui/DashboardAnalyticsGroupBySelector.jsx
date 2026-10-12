import PropTypes from 'prop-types';
import { MenuItem, Select } from '@mui/material';

export function DashboardAnalyticsGroupBySelector({ value, options, onChange }) {
   if (options.length <= 1) {
      return null;
   }

   return (
      <Select
         size="small"
         value={value}
         onChange={(event) => onChange(event.target.value)}
         sx={{ fontSize: 13, height: 32 }}
      >
         {options.map((option) => (
            <MenuItem key={option.value} value={option.value} sx={{ fontSize: 13 }}>
               {option.label}
            </MenuItem>
         ))}
      </Select>
   );
}

DashboardAnalyticsGroupBySelector.propTypes = {
   value: PropTypes.string,
   options: PropTypes.arrayOf(
      PropTypes.shape({
         value: PropTypes.string.isRequired,
         label: PropTypes.string.isRequired,
      }),
   ).isRequired,
   onChange: PropTypes.func.isRequired,
};

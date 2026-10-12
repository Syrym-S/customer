import PropTypes from 'prop-types';
import { FormControlLabel, Switch } from '@mui/material';

export function DashboardAnalyticsPreviousToggle({ checked, onChange }) {
   return (
      <FormControlLabel
         control={
            <Switch
               size="small"
               checked={checked}
               onChange={(event) => onChange(event.target.checked)}
            />
         }
         label="Сравнить с предыдущим периодом"
         sx={{ '& .MuiFormControlLabel-label': { fontSize: 13 } }}
      />
   );
}

DashboardAnalyticsPreviousToggle.propTypes = {
   checked: PropTypes.bool.isRequired,
   onChange: PropTypes.func.isRequired,
};

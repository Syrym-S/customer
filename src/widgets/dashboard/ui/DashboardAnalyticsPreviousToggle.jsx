import PropTypes from 'prop-types';
import { useTranslation } from "react-i18next";
import { FormControlLabel, Switch } from '@mui/material';

export function DashboardAnalyticsPreviousToggle({ checked, onChange }) {
   const { t } = useTranslation();

   return (
      <FormControlLabel
         control={
            <Switch
               size="small"
               checked={checked}
               onChange={(event) => onChange(event.target.checked)}
            />
         }
         label={t("dashboard.period.compare")}
         sx={{ '& .MuiFormControlLabel-label': { fontSize: 13 } }}
      />
   );
}

DashboardAnalyticsPreviousToggle.propTypes = {
   checked: PropTypes.bool.isRequired,
   onChange: PropTypes.func.isRequired,
};

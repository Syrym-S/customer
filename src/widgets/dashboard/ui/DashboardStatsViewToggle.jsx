import PropTypes from 'prop-types';
import { useTranslation } from "react-i18next";
import { ToggleButton, ToggleButtonGroup } from '@mui/material';

export const STATS_VIEW_MODE_COUNT = 'count';
export const STATS_VIEW_MODE_SUM = 'sum';

export function DashboardStatsViewToggle({ value, onChange }) {
   const { t } = useTranslation();

   function handleChange(_event, nextValue) {
      if (nextValue) {
         onChange(nextValue);
      }
   }

   return (
      <ToggleButtonGroup
         value={value}
         exclusive
         size="small"
         onChange={handleChange}
         aria-label={t("dashboard.stats.viewMode")}
      >
         <ToggleButton value={STATS_VIEW_MODE_COUNT}>{t("common.fields.quantity")}</ToggleButton>
         <ToggleButton value={STATS_VIEW_MODE_SUM}>{t("dashboard.stats.amounts")}</ToggleButton>
      </ToggleButtonGroup>
   );
}

DashboardStatsViewToggle.propTypes = {
   value: PropTypes.oneOf([STATS_VIEW_MODE_COUNT, STATS_VIEW_MODE_SUM])
      .isRequired,
   onChange: PropTypes.func.isRequired,
};

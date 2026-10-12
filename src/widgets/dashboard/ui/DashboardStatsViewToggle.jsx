import PropTypes from 'prop-types';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';

export const STATS_VIEW_MODE_COUNT = 'count';
export const STATS_VIEW_MODE_SUM = 'sum';

export function DashboardStatsViewToggle({ value, onChange }) {
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
         aria-label="Режим отображения статистики"
      >
         <ToggleButton value={STATS_VIEW_MODE_COUNT}>Количество</ToggleButton>
         <ToggleButton value={STATS_VIEW_MODE_SUM}>Суммы</ToggleButton>
      </ToggleButtonGroup>
   );
}

DashboardStatsViewToggle.propTypes = {
   value: PropTypes.oneOf([STATS_VIEW_MODE_COUNT, STATS_VIEW_MODE_SUM])
      .isRequired,
   onChange: PropTypes.func.isRequired,
};

import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Paper, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import TimelineIcon from '@mui/icons-material/Timeline';
import RouteIcon from '@mui/icons-material/Route';
import {
   ROUTE_VIEW_MODES,
   ROUTE_VIEW_MODE_ALL,
   ROUTE_VIEW_MODE_PASSED,
   ROUTE_VIEW_MODE_PLANNED,
} from '../model/route-view-mode';

const MODE_ICONS = {
   [ROUTE_VIEW_MODE_ALL]: AltRouteIcon,
   [ROUTE_VIEW_MODE_PASSED]: TimelineIcon,
   [ROUTE_VIEW_MODE_PLANNED]: RouteIcon,
};

const MODE_LABEL_KEYS = {
   [ROUTE_VIEW_MODE_ALL]: 'map.routeView.all',
   [ROUTE_VIEW_MODE_PASSED]: 'map.routeView.passed',
   [ROUTE_VIEW_MODE_PLANNED]: 'map.routeView.planned',
};

export function RouteViewModeToggle({ value, onChange }) {
   const { t } = useTranslation();

   function handleChange(_event, nextValue) {
      if (nextValue) {
         onChange(nextValue);
      }
   }

   return (
      <Paper
         elevation={3}
         sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 600,
            borderRadius: 1.5,
            overflow: 'hidden',
            pointerEvents: 'auto',
         }}
      >
         <ToggleButtonGroup
            value={value}
            exclusive
            size='small'
            onChange={handleChange}
            aria-label={t('map.routeView.label')}
         >
            {ROUTE_VIEW_MODES.map((mode) => {
               const ModeIcon = MODE_ICONS[mode];
               const label = t(MODE_LABEL_KEYS[mode]);

               return (
                  <Tooltip key={mode} title={label} placement='bottom'>
                     <ToggleButton
                        value={mode}
                        aria-label={label}
                        sx={{
                           border: 'none',
                           px: 1,
                           py: 0.75,
                           lineHeight: 1,
                        }}
                     >
                        <ModeIcon fontSize='small' />
                     </ToggleButton>
                  </Tooltip>
               );
            })}
         </ToggleButtonGroup>
      </Paper>
   );
}

RouteViewModeToggle.propTypes = {
   value: PropTypes.oneOf(ROUTE_VIEW_MODES).isRequired,
   onChange: PropTypes.func.isRequired,
};

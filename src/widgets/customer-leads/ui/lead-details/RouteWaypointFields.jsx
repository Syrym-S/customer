import {
   Box,
   Button,
   CircularProgress,
   IconButton,
   TextField,
} from '@mui/material';

import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import {
   getWaypointPointKey,
   setValueOptions,
} from '../../model/lead-route-editor.helpers';

export function RouteWaypointFields({
   waypoints,
   activeMapPoint,
   loadingPoints,
   setActiveMapPoint,
   setValue,
   clearWaypointPoint,
   handleRemoveWaypoint,
}) {
   return (
      <>
         {waypoints.map((waypoint, index) => {
            const pointKey = getWaypointPointKey(index);

            return (
               <Box
                  key={waypoint.id || pointKey}
                  sx={{
                     display: 'flex',
                     gap: 1,
                     alignItems: 'flex-start',
                     gridColumn: {
                        xs: 'auto',
                        sm: '1 / -1',
                     },
                  }}
               >
                  <TextField
                     label={`Промежуточная точка #${index + 1}`}
                     value={waypoint.location || ''}
                     onFocus={() => setActiveMapPoint(pointKey)}
                     onChange={(event) => {
                        setValue(
                           `waypoints.${index}.location`,
                           event.target.value,
                           setValueOptions,
                        );

                        if (waypoint.lat || waypoint.lng) {
                           clearWaypointPoint(index);
                        }
                     }}
                     fullWidth
                     size="small"
                     helperText={
                        loadingPoints[pointKey]
                           ? 'Определяем адрес...'
                           : 'Выберите эту точку и кликните по карте'
                     }
                     InputProps={{
                        endAdornment: loadingPoints[pointKey] ? (
                           <CircularProgress color="inherit" size={18} />
                        ) : null,
                     }}
                  />

                  <Button
                     size="small"
                     variant={
                        activeMapPoint === pointKey ? 'contained' : 'outlined'
                     }
                     onClick={() => setActiveMapPoint(pointKey)}
                     sx={{
                        whiteSpace: 'nowrap',
                        minHeight: 40,
                     }}
                  >
                     На карте
                  </Button>

                  <IconButton
                     color="error"
                     size="small"
                     onClick={() => handleRemoveWaypoint(index)}
                     sx={{
                        mt: 0.25,
                        flexShrink: 0,
                     }}
                     aria-label={`Удалить промежуточную точку ${index + 1}`}
                     title={`Удалить промежуточную точку ${index + 1}`}
                  >
                     <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
               </Box>
            );
         })}
      </>
   );
}

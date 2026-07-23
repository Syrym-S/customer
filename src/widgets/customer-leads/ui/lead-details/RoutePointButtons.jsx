import { Box, Button } from '@mui/material';
import { getWaypointPointKey } from '../../model/lead-route-editor.helpers';

export function RoutePointButtons({
   activeMapPoint,
   waypoints,
   isClearDisabled,
   setActiveMapPoint,
   handleAddWaypoint,
   handleClearRoute,
}) {
   return (
      <Box
         sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 1,
            mb: 2,
            flexWrap: 'wrap',
         }}
      >
         <Box
            sx={{
               display: 'flex',
               gap: 1,
               flexWrap: 'wrap',
            }}
         >
            <Button
               size="small"
               variant={activeMapPoint === 'from' ? 'contained' : 'outlined'}
               onClick={() => setActiveMapPoint('from')}
            >
               Откуда
            </Button>

            {waypoints.map((_, index) => {
               const pointKey = getWaypointPointKey(index);

               return (
                  <Button
                     key={pointKey}
                     size="small"
                     variant={
                        activeMapPoint === pointKey ? 'contained' : 'outlined'
                     }
                     onClick={() => setActiveMapPoint(pointKey)}
                  >
                     Точка {index + 1}
                  </Button>
               );
            })}

            <Button
               size="small"
               variant={activeMapPoint === 'to' ? 'contained' : 'outlined'}
               onClick={() => setActiveMapPoint('to')}
            >
               Куда
            </Button>

            <Button size="small" variant="outlined" onClick={handleAddWaypoint}>
               + Промежуточная
            </Button>
         </Box>

         <Button
            size="small"
            color="error"
            variant="outlined"
            onClick={handleClearRoute}
            disabled={isClearDisabled}
         >
            Очистить маршрут
         </Button>
      </Box>
   );
}

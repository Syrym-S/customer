import { Box, Button } from '@mui/material';
import { useTranslation } from "react-i18next";
import { getWaypointPointKey } from '../../model/lead-route-editor.helpers';

export function RoutePointButtons({
   activeMapPoint,
   waypoints,
   isClearDisabled,
   setActiveMapPoint,
   handleAddWaypoint,
   handleClearRoute,
}) {
   const { t } = useTranslation();

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
               {t("common.fields.origin")}
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
                     {t("route.point", { index: index + 1 })}
                  </Button>
               );
            })}

            <Button
               size="small"
               variant={activeMapPoint === 'to' ? 'contained' : 'outlined'}
               onClick={() => setActiveMapPoint('to')}
            >
               {t("common.fields.destination")}
            </Button>

            <Button size="small" variant="outlined" onClick={handleAddWaypoint}>
               {t("route.addWaypoint")}
            </Button>
         </Box>

         <Button
            size="small"
            color="error"
            variant="outlined"
            onClick={handleClearRoute}
            disabled={isClearDisabled}
         >
            {t("route.clear")}
         </Button>
      </Box>
   );
}

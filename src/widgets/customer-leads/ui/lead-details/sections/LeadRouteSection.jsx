import { Stack } from '@mui/material';
import PropTypes from 'prop-types';

import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined';
import TripOriginIcon from '@mui/icons-material/TripOrigin';

import { DetailSection } from '../components/DetailSection';
import { RoutePoint } from '../components/RoutePoint';

import { normalizeLocationValue } from '../../../model/lead-edit-form.helpers';
import {
   getPointScheduleByIndex,
   getPointScheduleLabel,
   getWaypointLabel,
   getWaypointTypeChipColor,
   getWaypointTypeLabel,
} from '../../../model/lead-route.helpers';
import { LeadRouteEditor } from '../LeadRouteEditor';

export function LeadRouteSection({
   lead,
   isEditing,
   editForm,
   routeControl,
   routeErrors,
   onTriggerRouteValidation,
   onRouteFieldChange,
}) {
   const waypoints = Array.isArray(lead.waypoints) ? lead.waypoints : [];
   const pointSchedules = Array.isArray(lead.point_schedules)
      ? lead.point_schedules
      : [];

   const lastPointIndex = waypoints.length + 1;

   return (
      <DetailSection icon={<RouteOutlinedIcon />} title="Маршрут">
         {isEditing ? (
            <LeadRouteEditor
               form={editForm}
               setValue={onRouteFieldChange}
               control={routeControl}
               errors={routeErrors}
               trigger={onTriggerRouteValidation}
            />
         ) : (
            <Stack spacing={1.25}>
               <RoutePoint
                  label="Откуда"
                  value={normalizeLocationValue(lead.from_location)}
                  icon={<TripOriginIcon />}
                  isPassed={Boolean(lead.from_location?.is_passed)}
                  date={getPointScheduleLabel(
                     getPointScheduleByIndex(pointSchedules, 0),
                  )}
               />

               {waypoints.map((waypoint, index) => (
                  <RoutePoint
                     key={waypoint.id || index}
                     label={`Промежуточная точка #${index + 1}`}
                     value={getWaypointLabel(waypoint)}
                     icon={<LocationOnOutlinedIcon />}
                     isPassed={Boolean(waypoint.is_passed)}
                     typeLabel={getWaypointTypeLabel(waypoint.type)}
                     typeColor={getWaypointTypeChipColor(waypoint.type)}
                     date={getPointScheduleLabel(
                        getPointScheduleByIndex(pointSchedules, index + 1),
                     )}
                  />
               ))}

               <RoutePoint
                  label="Куда"
                  value={normalizeLocationValue(lead.to_location)}
                  icon={<LocationOnOutlinedIcon />}
                  isPassed={Boolean(lead.to_location?.is_passed)}
                  date={getPointScheduleLabel(
                     getPointScheduleByIndex(pointSchedules, lastPointIndex),
                  )}
               />
            </Stack>
         )}
      </DetailSection>
   );
}

LeadRouteSection.propTypes = {
   lead: PropTypes.object.isRequired,
   isEditing: PropTypes.bool.isRequired,
   editForm: PropTypes.object.isRequired,
   routeControl: PropTypes.object,
   routeErrors: PropTypes.object,
   onTriggerRouteValidation: PropTypes.func,
   onRouteFieldChange: PropTypes.func,
};

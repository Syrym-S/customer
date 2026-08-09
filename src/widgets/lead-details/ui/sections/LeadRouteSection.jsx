import { Stack } from '@mui/material';

import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined';
import TripOriginIcon from '@mui/icons-material/TripOrigin';

import { DetailSection } from '../../../../shared/ui/DetailSection';
import { RoutePoint } from '../../../../entities/route/ui/RoutePoint';

import { getWaypointLabel } from '../../../../entities/lead/lib/lead-route.helpers';
import { LeadRouteEditor } from '../../../../features/edit-lead-route/ui/LeadRouteEditor';
import { normalizeLocationValue } from '../../../../shared/lib/location/location.helpers';

export function LeadRouteSection({ lead, isEditing, editForm, onEditChange }) {
   const waypoints = Array.isArray(lead.waypoints) ? lead.waypoints : [];

   return (
      <DetailSection icon={<RouteOutlinedIcon />} title='Маршрут'>
         {isEditing ? (
            <LeadRouteEditor form={editForm} setValue={onEditChange} />
         ) : (
            <Stack spacing={1.25}>
               <RoutePoint
                  label='Откуда'
                  value={normalizeLocationValue(lead.from_location)}
                  icon={<TripOriginIcon />}
               />

               {waypoints.map((waypoint, index) => (
                  <RoutePoint
                     key={waypoint.id || index}
                     label={`Промежуточная точка #${index + 1}`}
                     value={getWaypointLabel(waypoint)}
                     icon={<LocationOnOutlinedIcon />}
                  />
               ))}

               <RoutePoint
                  label='Куда'
                  value={normalizeLocationValue(lead.to_location)}
                  icon={<LocationOnOutlinedIcon />}
               />
            </Stack>
         )}
      </DetailSection>
   );
}


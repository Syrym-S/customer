import { Stack } from '@mui/material';
import PropTypes from 'prop-types';

import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined';
import TripOriginIcon from '@mui/icons-material/TripOrigin';

import { DetailSection } from '../components/DetailSection';
import { RoutePoint } from '../components/RoutePoint';

import { normalizeLocationValue } from '../../../model/lead-edit-form.helpers';
import { getWaypointLabel } from '../../../model/lead-route.helpers';
import { LeadRouteEditor } from '../LeadRouteEditor';

export function LeadRouteSection({ lead, isEditing, editForm, onEditChange }) {
   const waypoints = Array.isArray(lead.waypoints) ? lead.waypoints : [];

   return (
      <DetailSection icon={<RouteOutlinedIcon />} title="Маршрут">
         {isEditing ? (
            <LeadRouteEditor form={editForm} setValue={onEditChange} />
         ) : (
            <Stack spacing={1.25}>
               <RoutePoint
                  label="Откуда"
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
                  label="Куда"
                  value={normalizeLocationValue(lead.to_location)}
                  icon={<LocationOnOutlinedIcon />}
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
   onEditChange: PropTypes.func.isRequired,
};

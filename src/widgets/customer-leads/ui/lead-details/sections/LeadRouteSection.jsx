import { Box, TextField } from '@mui/material';
import PropTypes from 'prop-types';

import ArrowRightAltRoundedIcon from '@mui/icons-material/ArrowRightAltRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined';
import TripOriginIcon from '@mui/icons-material/TripOrigin';

import { DetailSection } from '../components/DetailSection';
import { RoutePoint } from '../components/RoutePoint';

import { normalizeLocationValue } from '../../../model/lead-edit-form.helpers';

export function LeadRouteSection({ lead, isEditing, editForm, onEditChange }) {
   return (
      <DetailSection icon={<RouteOutlinedIcon />} title='Маршрут'>
         <Box
            sx={{
               display: 'flex',
               alignItems: 'stretch',
               gap: 1.5,
               flexWrap: {
                  xs: 'wrap',
                  md: 'nowrap',
               },
            }}
         >
            {isEditing ? (
               <TextField
                  name='from_location'
                  label='Откуда'
                  value={editForm.from_location}
                  onChange={onEditChange}
                  fullWidth
                  size='small'
                  sx={{
                     flex: 1,
                     minWidth: 220,
                  }}
               />
            ) : (
               <RoutePoint
                  label='Откуда'
                  value={normalizeLocationValue(lead.from_location)}
                  icon={<TripOriginIcon />}
               />
            )}

            <Box
               sx={{
                  display: {
                     xs: 'none',
                     md: 'flex',
                  },
                  alignItems: 'center',
                  justifyContent: 'center',
                  px: 0.5,
               }}
            >
               <ArrowRightAltRoundedIcon
                  sx={{
                     color: 'text.secondary',
                     fontSize: 28,
                  }}
               />
            </Box>

            {isEditing ? (
               <TextField
                  name='to_location'
                  label='Куда'
                  value={editForm.to_location}
                  onChange={onEditChange}
                  fullWidth
                  size='small'
                  sx={{
                     flex: 1,
                     minWidth: 220,
                  }}
               />
            ) : (
               <RoutePoint
                  label='Куда'
                  value={normalizeLocationValue(lead.to_location)}
                  icon={<LocationOnOutlinedIcon />}
               />
            )}
         </Box>
      </DetailSection>
   );
}

LeadRouteSection.propTypes = {
   lead: PropTypes.object.isRequired,
   isEditing: PropTypes.bool.isRequired,
   editForm: PropTypes.object.isRequired,
   onEditChange: PropTypes.func.isRequired,
};

import { Box, TextField } from '@mui/material';
import PropTypes from 'prop-types';

import ArrowRightAltRoundedIcon from '@mui/icons-material/ArrowRightAltRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined';
import TripOriginIcon from '@mui/icons-material/TripOrigin';

import { DetailSection } from '../components/DetailSection';
import { RoutePoint } from '../components/RoutePoint';

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
                  sm: 'nowrap',
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
                  value={lead.from_location.trim()}
                  icon={<TripOriginIcon />}
               />
            )}

            <Box
               sx={{
                  display: {
                     xs: 'none',
                     sm: 'flex',
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
                  value={lead.to_location.trim()}
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

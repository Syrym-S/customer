import { Box } from '@mui/material';
import PropTypes from 'prop-types';

import { CustomerMapView } from '../../../../widgets/customer-map/ui/CustomerMapView';

export function LeadDetailsMap({ map }) {
   return (
      <Box
         sx={{
            height: {
               xs: 220,
               sm: 280,
            },
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            overflow: 'hidden',
            mb: 3,
            mt: 1,
         }}
      >
         <CustomerMapView
            center={map.center}
            zoom={map.zoom}
            markers={map.markers}
            routePoints={map.routePoints}
            handleMarkerClick={map.handleMarkerClick}
         />
      </Box>
   );
}

LeadDetailsMap.propTypes = {
   map: PropTypes.object.isRequired,
};

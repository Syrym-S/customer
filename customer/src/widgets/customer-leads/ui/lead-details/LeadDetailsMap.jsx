import PropTypes from 'prop-types';
import { Box, CircularProgress } from '@mui/material';

import { CustomerMapView } from '../../../customer-map/ui/CustomerMapView';

export function LeadDetailsMap({
   map,
   lead,
   routePoints = [],
   isRouteLoading = false,
}) {
   const hasRoutePoints = routePoints.length >= 2;

   const routeMarkers = hasRoutePoints
      ? [
           {
              id: 'route-start',
              position: routePoints[0],
              title: 'Откуда',
              description: lead.from_location || 'Не указано',
           },
           {
              id: 'route-end',
              position: routePoints[routePoints.length - 1],
              title: 'Куда',
              description: lead.to_location || 'Не указано',
           },
        ]
      : map.markers;

   return (
      <Box
         sx={{
            position: 'relative',
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
         {isRouteLoading && (
            <Box
               sx={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.55)',
               }}
            >
               <CircularProgress size={28} />
            </Box>
         )}

         <CustomerMapView
            center={hasRoutePoints ? routePoints[0] : map.center}
            zoom={hasRoutePoints ? 7 : map.zoom}
            markers={routeMarkers}
            routePoints={hasRoutePoints ? routePoints : map.routePoints}
            handleMarkerClick={map.handleMarkerClick}
         />
      </Box>
   );
}

LeadDetailsMap.propTypes = {
   map: PropTypes.shape({
      center: PropTypes.array.isRequired,
      zoom: PropTypes.number.isRequired,
      markers: PropTypes.array.isRequired,
      routePoints: PropTypes.array,
      handleMarkerClick: PropTypes.func.isRequired,
   }).isRequired,
   lead: PropTypes.shape({
      from_location: PropTypes.string,
      to_location: PropTypes.string,
   }).isRequired,
   routePoints: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
   isRouteLoading: PropTypes.bool,
};

import { Box } from '@mui/material';

import { CustomerMapView } from './CustomerMapView';
import { useCustomerMap } from '../model/useCustomerMap';

export function CustomerMap() {
   const map = useCustomerMap();

   return (
      <Box
         sx={{
            height: {
               xs: 320,
               md: 420,
            },
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            backgroundColor: 'background.paper',
            overflow: 'hidden',
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

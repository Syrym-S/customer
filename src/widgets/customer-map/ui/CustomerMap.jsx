import { Alert, Box, CircularProgress } from '@mui/material';

import { CustomerMapView } from './CustomerMapView';
import { useCustomerMap } from '../model/useCustomerMap';
import { useLeadsContext } from '../../customer-leads/model/useLeadsContext';
import { useCustomerPageRoutes } from '../model/useCustomerPageRoutes';

export function CustomerMap() {
   const map = useCustomerMap();
   const { leads, isLoading } = useLeadsContext();

   const { routes, isRoutesLoading, routesError } =
      useCustomerPageRoutes(leads);

   const hasRoutes = routes.length > 0;

   return (
      <Box>
         {routesError && (
            <Alert severity='warning' sx={{ mb: 2 }}>
               {routesError}
            </Alert>
         )}
         <Box
            sx={{
               position: 'relative',
               height: {
                  xs: 320,
                  md: 420,
               },
               minHeight: 320,
               border: '1px solid',
               borderColor: 'divider',
               borderRadius: 3,
               backgroundColor: 'background.paper',
               overflow: 'hidden',
            }}
         >
            {(isLoading || isRoutesLoading) && (
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
               center={map.center}
               zoom={map.zoom}
               markers={hasRoutes ? [] : map.markers}
               routePoints={map.routePoints}
               routes={routes}
               handleMarkerClick={map.handleMarkerClick}
            />
         </Box>
      </Box>
   );
}

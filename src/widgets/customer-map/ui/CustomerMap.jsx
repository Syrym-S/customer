import { Alert, Box, CircularProgress, Typography } from '@mui/material';

import { CustomerMapView } from './CustomerMapView';
import { useCustomerMap } from '../model/useCustomerMap';
import { useLeadsContext } from '../../customer-leads/model/useLeadsContext';
import { useCustomerPageRoutes } from '../model/useCustomerPageRoutes';
import { useCustomerPageGeoRoutes } from '../model/useCustomerPageGeoRoutes';

export function CustomerMap() {
   const map = useCustomerMap();
   const { leads, isLoading, setOpenLead } = useLeadsContext();

   const { routes, isRoutesLoading, routesError } =
      useCustomerPageRoutes(leads);
   const { geoRoutes, isGeoRoutesLoading, geoRoutesError } =
      useCustomerPageGeoRoutes(leads);

   const routeBoundsKey = routes
      .map((route) => route.id)
      .filter(Boolean)
      .sort()
      .join('|');

   const geoRouteBoundsKey = geoRoutes
      .map((route) => route.id)
      .filter(Boolean)
      .sort()
      .join('|');

   const leadsBoundsKey = leads
      .map((lead) => lead.id)
      .filter(Boolean)
      .sort()
      .join('|');

   const fitBoundsKey = routeBoundsKey || geoRouteBoundsKey || leadsBoundsKey;

   const hasRoutes = routes.length > 0 || geoRoutes.length > 0;
   const isMapLoading = isLoading || isRoutesLoading || isGeoRoutesLoading;

   function handleLeadRouteClick(lead) {
      if (!lead) {
         return;
      }

      setOpenLead(lead);
   }

   return (
      <Box>
         {(routesError || geoRoutesError) && (
            <Alert severity='warning' sx={{ mb: 2 }}>
               {routesError || geoRoutesError}
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
            {isMapLoading && (
               <Box
                  sx={{
                     position: 'absolute',
                     inset: 0,
                     zIndex: 1000,
                     display: 'flex',
                     flexDirection: 'column',
                     alignItems: 'center',
                     justifyContent: 'center',
                     gap: 1.5,
                     backgroundColor: 'rgba(255, 255, 255, 0.72)',
                     backdropFilter: 'blur(1px)',
                     pointerEvents: 'auto',
                  }}
               >
                  <CircularProgress size={28} />

                  <Typography
                     color='text.secondary'
                     sx={{
                        fontSize: 13,
                        fontWeight: 500,
                     }}
                  >
                     Загружаем карту...
                  </Typography>
               </Box>
            )}

            <CustomerMapView
               center={map.center}
               zoom={map.zoom}
               markers={hasRoutes ? [] : map.markers}
               routePoints={map.routePoints}
               routes={routes}
               geoRoutes={geoRoutes}
               fitBoundsKey={fitBoundsKey}
               handleMarkerClick={map.handleMarkerClick}
               onLeadClick={handleLeadRouteClick}
            />
         </Box>
      </Box>
   );
}

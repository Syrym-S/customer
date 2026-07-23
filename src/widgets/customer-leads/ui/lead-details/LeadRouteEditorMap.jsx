import { Box } from '@mui/material';
import { buildRouteEditorMapState } from '../../model/lead-route-editor.helpers';
import { CustomerMapView } from '../../../customer-map/ui/CustomerMapView';
import { useCustomerMap } from '../../../customer-map/model/useCustomerMap';

export function LeadRouteEditorMap({
   routeMarkers,
   routePoints,
   onMapClick,
   onMarkerDragEnd,
}) {
   const map = useCustomerMap();

   const { fitBoundsPoints, fitBoundsKey, center, zoom } =
      buildRouteEditorMapState({
         routeMarkers,
         map,
      });

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
            mb: 2,
         }}
      >
         <CustomerMapView
            center={center}
            zoom={zoom}
            markers={routeMarkers}
            routePoints={routePoints}
            fitBoundsKey={fitBoundsKey}
            fitBoundsPoints={fitBoundsPoints}
            handleMarkerClick={map.handleMarkerClick}
            onMapClick={onMapClick}
            onMarkerDragEnd={onMarkerDragEnd}
         />
      </Box>
   );
}

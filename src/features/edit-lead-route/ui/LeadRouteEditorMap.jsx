import { Box } from '@mui/material';
import { buildRouteEditorMapState } from '../model/lead-route-editor.helpers';
import { MapView } from '../../../shared/ui/map/MapView';

export function LeadRouteEditorMap({
   routeMarkers,
   routePoints,
   onMapClick,
   onMarkerDragEnd,
}) {
   const { fitBoundsPoints, fitBoundsKey, center, zoom } =
      buildRouteEditorMapState({
         routeMarkers,
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
         <MapView
            center={center}
            zoom={zoom}
            markers={routeMarkers}
            routePoints={routePoints}
            fitBoundsKey={fitBoundsKey}
            fitBoundsPoints={fitBoundsPoints}
            onMapClick={onMapClick}
            onMarkerDragEnd={onMarkerDragEnd}
         />
      </Box>
   );
}

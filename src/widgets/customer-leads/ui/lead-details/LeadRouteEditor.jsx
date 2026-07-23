import { useState } from 'react';

import { Box } from '@mui/material';
import { useRouteMapPicker } from '../../../../features/create-lead/model/useRouteMapPicker';
import { useRouteAddressSearch } from './hooks/useRouteAddressSearch';
import { RoutePointButtons } from './RoutePointButtons';
import { LeadRouteEditorMap } from './LeadRouteEditorMap';
import { RouteAddressAutocomplete } from './RouteAddressAutocomplete';
import { RouteWaypointFields } from './RouteWaypointFields';
import { setValueOptions } from '../../model/lead-route-editor.helpers';

export function LeadRouteEditor({ form, setValue }) {
   const [fromInputValue, setFromInputValue] = useState('');
   const [toInputValue, setToInputValue] = useState('');

   const waypoints = Array.isArray(form.waypoints) ? form.waypoints : [];

   const {
      activeMapPoint,
      loadingPoints,
      routeMarkers,
      routePoints,
      isClearDisabled,
      setActiveMapPoint,
      handleRouteMapClick,
      handleRouteMarkerDragEnd,
      handleClearRoute,
      clearFromPoint,
      clearToPoint,
      clearWaypointPoint,
      handleAddWaypoint,
      handleRemoveWaypoint,
      setSelectedLocationPoint,
   } = useRouteMapPicker({
      form,
      setValue,
   });

   const {
      options: fromOptions,
      setOptions: setFromOptions,
      isLoading: isFromSearchLoading,
   } = useRouteAddressSearch({
      inputValue: fromInputValue,
      currentValue: form.fromLocation || '',
   });

   const {
      options: toOptions,
      setOptions: setToOptions,
      isLoading: isToSearchLoading,
   } = useRouteAddressSearch({
      inputValue: toInputValue,
      currentValue: form.toLocation || '',
   });

   function handleFromInputChange(value) {
      setFromInputValue(value);
      setValue('fromLocation', value, setValueOptions);
      clearFromPoint();
   }

   function handleToInputChange(value) {
      setToInputValue(value);
      setValue('toLocation', value, setValueOptions);
      clearToPoint();
   }

   function handleFromSelect(selectedOption) {
      setSelectedLocationPoint('from', selectedOption);

      setFromInputValue(selectedOption.label || selectedOption.address || '');
      setFromOptions([]);
   }

   function handleToSelect(selectedOption) {
      setSelectedLocationPoint('to', selectedOption);

      setToInputValue(selectedOption.label || selectedOption.address || '');
      setToOptions([]);
   }

   return (
      <Box>
         <RoutePointButtons
            activeMapPoint={activeMapPoint}
            waypoints={waypoints}
            isClearDisabled={isClearDisabled}
            setActiveMapPoint={setActiveMapPoint}
            handleAddWaypoint={handleAddWaypoint}
            handleClearRoute={handleClearRoute}
         />

         <LeadRouteEditorMap
            routeMarkers={routeMarkers}
            routePoints={routePoints}
            onMapClick={handleRouteMapClick}
            onMarkerDragEnd={handleRouteMarkerDragEnd}
         />

         <Box
            sx={{
               display: 'grid',
               gridTemplateColumns: {
                  xs: '1fr',
                  sm: '1fr 1fr',
               },
               gap: 2,
            }}
         >
            <RouteAddressAutocomplete
               label="Откуда"
               value={form.fromLocation || ''}
               inputValue={fromInputValue || form.fromLocation || ''}
               options={fromOptions}
               isLoading={isFromSearchLoading || loadingPoints.from}
               onInputChange={handleFromInputChange}
               onSelect={handleFromSelect}
            />

            <RouteWaypointFields
               waypoints={waypoints}
               activeMapPoint={activeMapPoint}
               loadingPoints={loadingPoints}
               setActiveMapPoint={setActiveMapPoint}
               setValue={setValue}
               clearWaypointPoint={clearWaypointPoint}
               handleRemoveWaypoint={handleRemoveWaypoint}
            />

            <RouteAddressAutocomplete
               label="Куда"
               value={form.toLocation || ''}
               inputValue={toInputValue || form.toLocation || ''}
               options={toOptions}
               isLoading={isToSearchLoading || loadingPoints.to}
               onInputChange={handleToInputChange}
               onSelect={handleToSelect}
            />
         </Box>
      </Box>
   );
}

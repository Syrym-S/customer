import { useState } from 'react';

import { Box, TextField } from '@mui/material';
import { Controller } from 'react-hook-form';

import { useRouteMapPicker } from '../../../../features/create-lead/model/useRouteMapPicker';
import {
   buildPointScheduleFields,
   getEndAtChangeDependentField,
   getEndAtMin,
   getStartAtChangeDependentField,
   getStartAtMin,
   validateEndAtOwnStart,
   validateStartAtChain,
} from '../../../../features/create-lead/lib/point-schedule.helpers';
import { useRouteAddressSearch } from './hooks/useRouteAddressSearch';
import { RoutePointButtons } from './RoutePointButtons';
import { LeadRouteEditorMap } from './LeadRouteEditorMap';
import { RouteAddressAutocomplete } from './RouteAddressAutocomplete';
import { RouteWaypointFields } from './RouteWaypointFields';
import { setValueOptions } from '../../model/lead-route-editor.helpers';

const dateFieldSx = { flex: 1, minWidth: 160 };

export function LeadRouteEditor({ form, setValue, control, errors, trigger }) {
   const [fromInputValue, setFromInputValue] = useState('');
   const [toInputValue, setToInputValue] = useState('');

   const waypoints = Array.isArray(form.waypoints) ? form.waypoints : [];
   const pointScheduleFields = buildPointScheduleFields(waypoints);

   function handleStartAtChange(fieldName, onChange) {
      return (event) => {
         onChange(event);
         setValue(fieldName, event.target.value, setValueOptions);

         const dependentField = getStartAtChangeDependentField(
            pointScheduleFields,
            fieldName,
         );

         if (dependentField) {
            trigger(dependentField);
         }
      };
   }

   function handleEndAtChange(fieldName, onChange) {
      return (event) => {
         onChange(event);
         setValue(fieldName, event.target.value, setValueOptions);

         const dependentField = getEndAtChangeDependentField(
            pointScheduleFields,
            fieldName,
         );

         if (dependentField) {
            trigger(dependentField);
         }
      };
   }

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

            <Box
               sx={{
                  display: 'flex',
                  gap: 1,
                  flexWrap: 'wrap',
                  gridColumn: {
                     xs: 'auto',
                     sm: '1 / -1',
                  },
               }}
            >
               <Controller
                  name="fromStartAt"
                  control={control}
                  rules={{
                     required: 'Укажите дату начала в точке отправления',
                     validate: validateStartAtChain(
                        form,
                        pointScheduleFields,
                        'fromStartAt',
                     ),
                  }}
                  render={({ field }) => (
                     <TextField
                        {...field}
                        onChange={handleStartAtChange(
                           'fromStartAt',
                           field.onChange,
                        )}
                        label="Начало (Откуда)"
                        type="date"
                        size="small"
                        error={Boolean(errors?.fromStartAt)}
                        helperText={errors?.fromStartAt?.message}
                        sx={dateFieldSx}
                        slotProps={{
                           inputLabel: { shrink: true },
                        }}
                     />
                  )}
               />

               <Controller
                  name="fromEndAt"
                  control={control}
                  rules={{
                     required: 'Укажите дату окончания в точке отправления',
                     validate: validateEndAtOwnStart(
                        form,
                        pointScheduleFields,
                        'fromEndAt',
                     ),
                  }}
                  render={({ field }) => (
                     <TextField
                        {...field}
                        onChange={handleEndAtChange(
                           'fromEndAt',
                           field.onChange,
                        )}
                        label="Окончание (Откуда)"
                        type="date"
                        size="small"
                        error={Boolean(errors?.fromEndAt)}
                        helperText={errors?.fromEndAt?.message}
                        sx={dateFieldSx}
                        slotProps={{
                           inputLabel: { shrink: true },
                           htmlInput: (() => {
                              const min = getEndAtMin(
                                 form,
                                 pointScheduleFields,
                                 'fromEndAt',
                              );

                              return min ? { min } : undefined;
                           })(),
                        }}
                     />
                  )}
               />
            </Box>

            <RouteWaypointFields
               waypoints={waypoints}
               activeMapPoint={activeMapPoint}
               loadingPoints={loadingPoints}
               setActiveMapPoint={setActiveMapPoint}
               setValue={setValue}
               clearWaypointPoint={clearWaypointPoint}
               handleRemoveWaypoint={handleRemoveWaypoint}
               control={control}
               errors={errors}
               form={form}
               pointScheduleFields={pointScheduleFields}
               trigger={trigger}
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

            <Box
               sx={{
                  display: 'flex',
                  gap: 1,
                  flexWrap: 'wrap',
                  gridColumn: {
                     xs: 'auto',
                     sm: '1 / -1',
                  },
               }}
            >
               <Controller
                  name="toStartAt"
                  control={control}
                  rules={{
                     required: 'Укажите дату начала в точке назначения',
                     validate: validateStartAtChain(
                        form,
                        pointScheduleFields,
                        'toStartAt',
                     ),
                  }}
                  render={({ field }) => (
                     <TextField
                        {...field}
                        onChange={handleStartAtChange(
                           'toStartAt',
                           field.onChange,
                        )}
                        label="Начало (Куда)"
                        type="date"
                        size="small"
                        error={Boolean(errors?.toStartAt)}
                        helperText={errors?.toStartAt?.message}
                        sx={dateFieldSx}
                        slotProps={{
                           inputLabel: { shrink: true },
                           htmlInput: (() => {
                              const min = getStartAtMin(
                                 form,
                                 pointScheduleFields,
                                 'toStartAt',
                              );

                              return min ? { min } : undefined;
                           })(),
                        }}
                     />
                  )}
               />

               <Controller
                  name="toEndAt"
                  control={control}
                  rules={{
                     required: 'Укажите дату окончания в точке назначения',
                     validate: validateEndAtOwnStart(
                        form,
                        pointScheduleFields,
                        'toEndAt',
                     ),
                  }}
                  render={({ field }) => (
                     <TextField
                        {...field}
                        onChange={handleEndAtChange('toEndAt', field.onChange)}
                        label="Окончание (Куда)"
                        type="date"
                        size="small"
                        error={Boolean(errors?.toEndAt)}
                        helperText={errors?.toEndAt?.message}
                        sx={dateFieldSx}
                        slotProps={{
                           inputLabel: { shrink: true },
                           htmlInput: (() => {
                              const min = getEndAtMin(
                                 form,
                                 pointScheduleFields,
                                 'toEndAt',
                              );

                              return min ? { min } : undefined;
                           })(),
                        }}
                     />
                  )}
               />
            </Box>
         </Box>
      </Box>
   );
}

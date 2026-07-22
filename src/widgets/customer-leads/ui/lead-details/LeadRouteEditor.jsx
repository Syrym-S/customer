import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import {
   Autocomplete,
   Box,
   Button,
   CircularProgress,
   IconButton,
   TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';

import { CustomerMapView } from '../../../customer-map/ui/CustomerMapView';
import { useCustomerMap } from '../../../customer-map/model/useCustomerMap';
import { useRouteMapPicker } from '../../../../features/create-lead/model/useRouteMapPicker';
import { searchGeocode } from '../../../../features/create-lead/api/geocoding.api';

const setValueOptions = {
   shouldDirty: true,
   shouldTouch: true,
   shouldValidate: true,
};

export function LeadRouteEditor({ form, setValue }) {
   const map = useCustomerMap();

   const [fromInputValue, setFromInputValue] = useState('');
   const [toInputValue, setToInputValue] = useState('');

   const [fromOptions, setFromOptions] = useState([]);
   const [toOptions, setToOptions] = useState([]);

   const [isFromSearchLoading, setIsFromSearchLoading] = useState(false);
   const [isToSearchLoading, setIsToSearchLoading] = useState(false);

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

   useEffect(() => {
      const query = fromInputValue.trim();

      if (query.length < 2 || query === form.fromLocation) {
         setFromOptions([]);
         return;
      }

      const controller = new AbortController();

      const timeoutId = setTimeout(async () => {
         try {
            setIsFromSearchLoading(true);

            const result = await searchGeocode(query, {
               signal: controller.signal,
            });

            setFromOptions(result);
         } catch (error) {
            if (error.name !== 'AbortError') {
               console.error(error);
               setFromOptions([]);
            }
         } finally {
            setIsFromSearchLoading(false);
         }
      }, 300);

      return () => {
         controller.abort();
         clearTimeout(timeoutId);
      };
   }, [fromInputValue, form.fromLocation]);

   useEffect(() => {
      const query = toInputValue.trim();

      if (query.length < 2 || query === form.toLocation) {
         setToOptions([]);
         return;
      }

      const controller = new AbortController();

      const timeoutId = setTimeout(async () => {
         try {
            setIsToSearchLoading(true);

            const result = await searchGeocode(query, {
               signal: controller.signal,
            });

            setToOptions(result);
         } catch (error) {
            if (error.name !== 'AbortError') {
               console.error(error);
               setToOptions([]);
            }
         } finally {
            setIsToSearchLoading(false);
         }
      }, 300);

      return () => {
         controller.abort();
         clearTimeout(timeoutId);
      };
   }, [toInputValue, form.toLocation]);

   return (
      <Box>
         <Box
            sx={{
               display: 'flex',
               justifyContent: 'space-between',
               alignItems: 'center',
               gap: 1,
               mb: 2,
               flexWrap: 'wrap',
            }}
         >
            <Box
               sx={{
                  display: 'flex',
                  gap: 1,
                  flexWrap: 'wrap',
               }}
            >
               <Button
                  size="small"
                  variant={activeMapPoint === 'from' ? 'contained' : 'outlined'}
                  onClick={() => setActiveMapPoint('from')}
               >
                  Откуда
               </Button>

               {waypoints.map((_, index) => {
                  const pointKey = `waypoint-${index}`;

                  return (
                     <Button
                        key={pointKey}
                        size="small"
                        variant={
                           activeMapPoint === pointKey
                              ? 'contained'
                              : 'outlined'
                        }
                        onClick={() => setActiveMapPoint(pointKey)}
                     >
                        Точка {index + 1}
                     </Button>
                  );
               })}

               <Button
                  size="small"
                  variant={activeMapPoint === 'to' ? 'contained' : 'outlined'}
                  onClick={() => setActiveMapPoint('to')}
               >
                  Куда
               </Button>

               <Button
                  size="small"
                  variant="outlined"
                  onClick={handleAddWaypoint}
               >
                  + Промежуточная
               </Button>
            </Box>

            <Button
               size="small"
               color="error"
               variant="outlined"
               onClick={handleClearRoute}
               disabled={isClearDisabled}
            >
               Очистить маршрут
            </Button>
         </Box>

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
               center={map.center}
               zoom={map.zoom}
               markers={routeMarkers}
               routePoints={routePoints}
               handleMarkerClick={map.handleMarkerClick}
               onMapClick={handleRouteMapClick}
               onMarkerDragEnd={handleRouteMarkerDragEnd}
            />
         </Box>

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
            <Autocomplete
               freeSolo
               value={form.fromLocation || ''}
               inputValue={fromInputValue || form.fromLocation || ''}
               options={fromOptions}
               loading={isFromSearchLoading || loadingPoints.from}
               filterOptions={(items) => items}
               getOptionLabel={(option) => {
                  if (typeof option === 'string') {
                     return option;
                  }

                  return option?.label || option?.address || '';
               }}
               isOptionEqualToValue={(option, value) => {
                  if (typeof value === 'string') {
                     return (
                        option?.label === value || option?.address === value
                     );
                  }

                  return option?.address === value?.address;
               }}
               onInputChange={(_, newInputValue, reason) => {
                  if (reason === 'reset') {
                     return;
                  }

                  setFromInputValue(newInputValue);
                  setValue('fromLocation', newInputValue, setValueOptions);
                  clearFromPoint();
               }}
               onChange={(_, selectedOption) => {
                  if (!selectedOption || typeof selectedOption === 'string') {
                     return;
                  }

                  setSelectedLocationPoint('from', selectedOption);

                  setFromInputValue(
                     selectedOption.label || selectedOption.address || '',
                  );

                  setFromOptions([]);
               }}
               noOptionsText={
                  fromInputValue.trim().length < 2
                     ? 'Введите минимум 2 символа'
                     : 'Адрес не найден'
               }
               loadingText="Поиск адреса..."
               renderInput={(params) => {
                  const inputProps = params.InputProps || {};

                  return (
                     <TextField
                        {...params}
                        label="Откуда"
                        fullWidth
                        size="small"
                        InputProps={{
                           ...inputProps,
                           endAdornment: (
                              <>
                                 {(isFromSearchLoading ||
                                    loadingPoints.from) && (
                                    <CircularProgress
                                       color="inherit"
                                       size={18}
                                    />
                                 )}

                                 {inputProps.endAdornment}
                              </>
                           ),
                        }}
                     />
                  );
               }}
            />

            {waypoints.map((waypoint, index) => {
               const pointKey = `waypoint-${index}`;

               return (
                  <Box
                     key={waypoint.id || pointKey}
                     sx={{
                        display: 'flex',
                        gap: 1,
                        alignItems: 'flex-start',
                        gridColumn: {
                           xs: 'auto',
                           sm: '1 / -1',
                        },
                     }}
                  >
                     <TextField
                        label={`Промежуточная точка #${index + 1}`}
                        value={waypoint.location || ''}
                        onFocus={() => setActiveMapPoint(pointKey)}
                        onChange={(event) => {
                           setValue(
                              `waypoints.${index}.location`,
                              event.target.value,
                              setValueOptions,
                           );

                           if (waypoint.lat || waypoint.lng) {
                              clearWaypointPoint(index);
                           }
                        }}
                        fullWidth
                        size="small"
                        helperText={
                           loadingPoints[pointKey]
                              ? 'Определяем адрес...'
                              : 'Выберите эту точку и кликните по карте'
                        }
                        InputProps={{
                           endAdornment: loadingPoints[pointKey] ? (
                              <CircularProgress color="inherit" size={18} />
                           ) : null,
                        }}
                     />

                     <Button
                        size="small"
                        variant={
                           activeMapPoint === pointKey
                              ? 'contained'
                              : 'outlined'
                        }
                        onClick={() => setActiveMapPoint(pointKey)}
                        sx={{
                           whiteSpace: 'nowrap',
                           minHeight: 40,
                        }}
                     >
                        На карте
                     </Button>

                     <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleRemoveWaypoint(index)}
                        sx={{
                           mt: 0.25,
                           flexShrink: 0,
                        }}
                        aria-label={`Удалить промежуточную точку ${index + 1}`}
                        title={`Удалить промежуточную точку ${index + 1}`}
                     >
                        <DeleteOutlineRoundedIcon fontSize="small" />
                     </IconButton>
                  </Box>
               );
            })}

            <Autocomplete
               freeSolo
               value={form.toLocation || ''}
               inputValue={toInputValue || form.toLocation || ''}
               options={toOptions}
               loading={isToSearchLoading || loadingPoints.to}
               filterOptions={(items) => items}
               getOptionLabel={(option) => {
                  if (typeof option === 'string') {
                     return option;
                  }

                  return option?.label || option?.address || '';
               }}
               isOptionEqualToValue={(option, value) => {
                  if (typeof value === 'string') {
                     return (
                        option?.label === value || option?.address === value
                     );
                  }

                  return option?.address === value?.address;
               }}
               onInputChange={(_, newInputValue, reason) => {
                  if (reason === 'reset') {
                     return;
                  }

                  setToInputValue(newInputValue);
                  setValue('toLocation', newInputValue, setValueOptions);
                  clearToPoint();
               }}
               onChange={(_, selectedOption) => {
                  if (!selectedOption || typeof selectedOption === 'string') {
                     return;
                  }

                  setSelectedLocationPoint('to', selectedOption);

                  setToInputValue(
                     selectedOption.label || selectedOption.address || '',
                  );

                  setToOptions([]);
               }}
               noOptionsText={
                  toInputValue.trim().length < 2
                     ? 'Введите минимум 2 символа'
                     : 'Адрес не найден'
               }
               loadingText="Поиск адреса..."
               renderInput={(params) => {
                  const inputProps = params.InputProps || {};

                  return (
                     <TextField
                        {...params}
                        label="Куда"
                        fullWidth
                        size="small"
                        InputProps={{
                           ...inputProps,
                           endAdornment: (
                              <>
                                 {(isToSearchLoading || loadingPoints.to) && (
                                    <CircularProgress
                                       color="inherit"
                                       size={18}
                                    />
                                 )}

                                 {inputProps.endAdornment}
                              </>
                           ),
                        }}
                     />
                  );
               }}
            />
         </Box>
      </Box>
   );
}

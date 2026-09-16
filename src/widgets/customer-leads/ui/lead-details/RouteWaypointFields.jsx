import {
   Box,
   Button,
   CircularProgress,
   FormControl,
   FormHelperText,
   IconButton,
   InputLabel,
   MenuItem,
   Select,
   TextField,
} from '@mui/material';
import { Controller } from 'react-hook-form';

import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import {
   getEndAtMin,
   getStartAtMin,
   hasWaypointCoordinates,
   validateEndAtOwnStart,
   validateStartAtChain,
} from '../../../../features/create-lead/lib/point-schedule.helpers';
import {
   getWaypointPointKey,
   setValueOptions,
} from '../../model/lead-route-editor.helpers';

const dateFieldSx = { flex: 1, minWidth: 160 };

export function RouteWaypointFields({
   waypoints,
   activeMapPoint,
   loadingPoints,
   setActiveMapPoint,
   setValue,
   clearWaypointPoint,
   handleRemoveWaypoint,
   control,
   errors,
   form,
   pointScheduleFields,
   trigger,
}) {
   function handleStartAtChange(fieldName, onChange) {
      return (event) => {
         onChange(event);
         setValue(fieldName, event.target.value, setValueOptions);

         const pointIndex = pointScheduleFields.findIndex(
            (point) => point.startField === fieldName,
         );

         if (pointIndex !== -1) {
            trigger(pointScheduleFields[pointIndex].endField);
         }
      };
   }

   function handleEndAtChange(fieldName, onChange) {
      return (event) => {
         onChange(event);
         setValue(fieldName, event.target.value, setValueOptions);

         const pointIndex = pointScheduleFields.findIndex(
            (point) => point.endField === fieldName,
         );

         if (pointIndex !== -1 && pointScheduleFields[pointIndex + 1]) {
            trigger(pointScheduleFields[pointIndex + 1].startField);
         }
      };
   }

   return (
      <>
         {waypoints.map((waypoint, index) => {
            const pointKey = getWaypointPointKey(index);
            const locationFieldName = `waypoints.${index}.location`;
            const typeFieldName = `waypoints.${index}.type`;
            const startAtFieldName = `waypoints.${index}.startAt`;
            const endAtFieldName = `waypoints.${index}.endAt`;

            const locationError = errors?.waypoints?.[index]?.location;
            const typeError = errors?.waypoints?.[index]?.type;
            const startAtError = errors?.waypoints?.[index]?.startAt;
            const endAtError = errors?.waypoints?.[index]?.endAt;

            const startAtMin = getStartAtMin(
               form,
               pointScheduleFields,
               startAtFieldName,
            );
            const endAtMin = getEndAtMin(
               form,
               pointScheduleFields,
               endAtFieldName,
            );

            return (
               <Box
                  key={waypoint.id || pointKey}
                  sx={{
                     display: 'flex',
                     flexDirection: 'column',
                     gap: 1,
                     gridColumn: {
                        xs: 'auto',
                        sm: '1 / -1',
                     },
                  }}
               >
                  <Box
                     sx={{
                        display: 'flex',
                        gap: 1,
                        alignItems: 'flex-start',
                     }}
                  >
                     <Controller
                        name={locationFieldName}
                        control={control}
                        rules={{
                           required:
                              'Выберите эту точку и кликните по карте',
                           validate: () =>
                              hasWaypointCoordinates(waypoint) ||
                              `Укажите координаты для точки ${index + 1}: кликните по карте`,
                        }}
                        render={({ field }) => (
                           <TextField
                              {...field}
                              label={`Промежуточная точка #${index + 1}`}
                              value={waypoint.location || ''}
                              onFocus={() => setActiveMapPoint(pointKey)}
                              onChange={(event) => {
                                 field.onChange(event);
                                 setValue(
                                    locationFieldName,
                                    event.target.value,
                                    setValueOptions,
                                 );

                                 if (waypoint.lat || waypoint.lng) {
                                    clearWaypointPoint(index);
                                 }
                              }}
                              fullWidth
                              size="small"
                              error={Boolean(locationError)}
                              helperText={
                                 locationError?.message ||
                                 (loadingPoints[pointKey]
                                    ? 'Определяем адрес...'
                                    : 'Выберите эту точку и кликните по карте')
                              }
                              InputProps={{
                                 endAdornment: loadingPoints[pointKey] ? (
                                    <CircularProgress
                                       color="inherit"
                                       size={18}
                                    />
                                 ) : null,
                              }}
                           />
                        )}
                     />

                     <Button
                        size="small"
                        variant={
                           activeMapPoint === pointKey ? 'contained' : 'outlined'
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

                  <Box
                     sx={{
                        display: 'flex',
                        gap: 1,
                        flexWrap: 'wrap',
                     }}
                  >
                     <Controller
                        name={typeFieldName}
                        control={control}
                        render={({ field }) => (
                           <FormControl
                              size="small"
                              fullWidth
                              error={Boolean(typeError)}
                              sx={{
                                 flex: 1,
                                 minWidth: 160,
                              }}
                           >
                              <InputLabel id={`${pointKey}-type-label`}>
                                 Тип точки
                              </InputLabel>
                              <Select
                                 {...field}
                                 labelId={`${pointKey}-type-label`}
                                 label="Тип точки"
                                 value={field.value || 'check_passes'}
                                 onChange={(event) => {
                                    field.onChange(event);
                                    setValue(
                                       typeFieldName,
                                       event.target.value,
                                       setValueOptions,
                                    );
                                 }}
                              >
                                 <MenuItem value="loading">Погрузка</MenuItem>
                                 <MenuItem value="unloading">
                                    Разгрузка
                                 </MenuItem>
                                 <MenuItem value="check_passes">
                                    Транзит
                                 </MenuItem>
                              </Select>
                              <FormHelperText>
                                 {typeError?.message}
                              </FormHelperText>
                           </FormControl>
                        )}
                     />

                     <Controller
                        name={startAtFieldName}
                        control={control}
                        rules={{
                           required: `Укажите дату начала для точки ${index + 1}`,
                           validate: validateStartAtChain(
                              form,
                              pointScheduleFields,
                              startAtFieldName,
                           ),
                        }}
                        render={({ field }) => (
                           <TextField
                              {...field}
                              onChange={handleStartAtChange(
                                 startAtFieldName,
                                 field.onChange,
                              )}
                              label={`Начало (точка ${index + 1})`}
                              type="date"
                              size="small"
                              error={Boolean(startAtError)}
                              helperText={startAtError?.message}
                              sx={dateFieldSx}
                              slotProps={{
                                 inputLabel: { shrink: true },
                                 htmlInput: startAtMin
                                    ? { min: startAtMin }
                                    : undefined,
                              }}
                           />
                        )}
                     />

                     <Controller
                        name={endAtFieldName}
                        control={control}
                        rules={{
                           required: `Укажите дату окончания для точки ${index + 1}`,
                           validate: validateEndAtOwnStart(
                              form,
                              pointScheduleFields,
                              endAtFieldName,
                           ),
                        }}
                        render={({ field }) => (
                           <TextField
                              {...field}
                              onChange={handleEndAtChange(
                                 endAtFieldName,
                                 field.onChange,
                              )}
                              label={`Окончание (точка ${index + 1})`}
                              type="date"
                              size="small"
                              error={Boolean(endAtError)}
                              helperText={endAtError?.message}
                              sx={dateFieldSx}
                              slotProps={{
                                 inputLabel: { shrink: true },
                                 htmlInput: endAtMin
                                    ? { min: endAtMin }
                                    : undefined,
                              }}
                           />
                        )}
                     />
                  </Box>
               </Box>
            );
         })}
      </>
   );
}

import { Box, Button, TextField } from '@mui/material';
import PropTypes from 'prop-types';
import { Controller } from 'react-hook-form';

import { CustomerMapView } from '../../../../../widgets/customer-map/ui/CustomerMapView';
import { useCustomerMap } from '../../../../../widgets/customer-map/model/useCustomerMap';
import { useRouteMapPicker } from '../../../model/useRouteMapPicker';
import { StepSection } from '../components/StepSection';

export function RouteStep({ control, errors, form, setValue }) {
   const map = useCustomerMap();

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
   } = useRouteMapPicker({
      form,
      setValue,
   });

   return (
      <StepSection title='Маршрут'>
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
                  size='small'
                  variant={activeMapPoint === 'from' ? 'contained' : 'outlined'}
                  onClick={() => setActiveMapPoint('from')}
               >
                  Откуда
               </Button>

               <Button
                  size='small'
                  variant={activeMapPoint === 'to' ? 'contained' : 'outlined'}
                  onClick={() => setActiveMapPoint('to')}
               >
                  Куда
               </Button>
            </Box>

            <Button
               size='small'
               color='error'
               variant='outlined'
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
            <Controller
               name='fromLocation'
               control={control}
               rules={{
                  required: 'Укажите место отправления',
                  minLength: {
                     value: 3,
                     message: 'Минимум 3 символа',
                  },
               }}
               render={({ field }) => (
                  <TextField
                     {...field}
                     label='Откуда'
                     fullWidth
                     size='small'
                     disabled={loadingPoints.from}
                     error={Boolean(errors.fromLocation)}
                     helperText={errors.fromLocation?.message}
                     onChange={(event) => {
                        field.onChange(event);
                        clearFromPoint();
                     }}
                  />
               )}
            />

            <Controller
               name='toLocation'
               control={control}
               rules={{
                  required: 'Укажите место назначения',
                  minLength: {
                     value: 3,
                     message: 'Минимум 3 символа',
                  },
               }}
               render={({ field }) => (
                  <TextField
                     {...field}
                     label='Куда'
                     fullWidth
                     size='small'
                     disabled={loadingPoints.to}
                     error={Boolean(errors.toLocation)}
                     helperText={errors.toLocation?.message}
                     onChange={(event) => {
                        field.onChange(event);
                        clearToPoint();
                     }}
                  />
               )}
            />

            <Controller
               name='loadingDate'
               control={control}
               render={({ field }) => (
                  <TextField
                     {...field}
                     label='Дата загрузки'
                     type='date'
                     fullWidth
                     size='small'
                     slotProps={{
                        inputLabel: {
                           shrink: true,
                        },
                     }}
                     sx={{
                        gridColumn: {
                           xs: 'auto',
                           sm: '1 / -1',
                        },
                     }}
                  />
               )}
            />
         </Box>
      </StepSection>
   );
}

RouteStep.propTypes = {
   control: PropTypes.object.isRequired,
   errors: PropTypes.object.isRequired,
   form: PropTypes.object.isRequired,
   setValue: PropTypes.func.isRequired,
};

import {
   Box,
   FormControl,
   InputLabel,
   MenuItem,
   Select,
} from '@mui/material';
import PropTypes from 'prop-types';

import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';

import { DetailSection } from '../components/DetailSection';
import { InfoBadge } from '../components/InfoBadge';
import {
   getCompositionTypeLabel,
   getLoadingTypeLabel,
   getPackagingTypeLabel,
   getTransportationSelectOptions,
   getTransportTypeLabel,
} from '../../../model/lead-transportation.helpers';
import { useLeadParamsOptions } from '../../../model/lead-params.store';

export function LeadTransportationSection({
   lead,
   isEditing,
   editForm,
   onEditChange,
}) {
   const transportationOptions = useLeadParamsOptions();

   const loadingTypeLabel = getLoadingTypeLabel(lead.loadingType);
   const packagingTypeLabel = getPackagingTypeLabel(lead.packagingType);
   const compositionTypeLabel = getCompositionTypeLabel(lead.compositionType);
   const transportTypeLabel = getTransportTypeLabel(lead.transportType);

   const loadingTypeSelectOptions = getTransportationSelectOptions(
      transportationOptions.loadingType,
      editForm.loadingType,
   );
   const packagingTypeSelectOptions = getTransportationSelectOptions(
      transportationOptions.packagingType,
      editForm.packagingType,
   );
   const compositionTypeSelectOptions = getTransportationSelectOptions(
      transportationOptions.compositionType,
      editForm.compositionType,
   );
   const transportTypeSelectOptions = getTransportationSelectOptions(
      transportationOptions.transportType,
      editForm.transportType,
   );

   const hasAnyValue =
      loadingTypeLabel ||
      packagingTypeLabel ||
      compositionTypeLabel ||
      transportTypeLabel;

   if (!isEditing && !hasAnyValue) {
      return null;
   }

   return (
      <DetailSection
         icon={<LocalShippingOutlinedIcon />}
         title="Параметры перевозки"
      >
         <Box
            sx={{
               display: 'grid',
               gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(4, 1fr)',
               },
               gap: 1,
            }}
         >
            {isEditing ? (
               <>
                  <FormControl fullWidth size="small">
                     <InputLabel id="lead-loading-type-label">
                        Тип погрузки
                     </InputLabel>
                     <Select
                        labelId="lead-loading-type-label"
                        label="Тип погрузки"
                        name="loadingType"
                        value={editForm.loadingType || ''}
                        onChange={onEditChange}
                     >
                        <MenuItem value="">Не указан</MenuItem>
                        {loadingTypeSelectOptions.map((option) => (
                           <MenuItem key={option.value} value={option.value}>
                              {option.label}
                           </MenuItem>
                        ))}
                     </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                     <InputLabel id="lead-packaging-type-label">
                        Вид упаковки
                     </InputLabel>
                     <Select
                        labelId="lead-packaging-type-label"
                        label="Вид упаковки"
                        name="packagingType"
                        value={editForm.packagingType || ''}
                        onChange={onEditChange}
                     >
                        <MenuItem value="">Не указан</MenuItem>
                        {packagingTypeSelectOptions.map((option) => (
                           <MenuItem key={option.value} value={option.value}>
                              {option.label}
                           </MenuItem>
                        ))}
                     </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                     <InputLabel id="lead-composition-type-label">
                        Тип состава
                     </InputLabel>
                     <Select
                        labelId="lead-composition-type-label"
                        label="Тип состава"
                        name="compositionType"
                        value={editForm.compositionType || ''}
                        onChange={onEditChange}
                     >
                        <MenuItem value="">Не указан</MenuItem>
                        {compositionTypeSelectOptions.map((option) => (
                           <MenuItem key={option.value} value={option.value}>
                              {option.label}
                           </MenuItem>
                        ))}
                     </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                     <InputLabel id="lead-transport-type-label">
                        Тип транспорта
                     </InputLabel>
                     <Select
                        labelId="lead-transport-type-label"
                        label="Тип транспорта"
                        name="transportType"
                        value={editForm.transportType || ''}
                        onChange={onEditChange}
                     >
                        <MenuItem value="">Не указан</MenuItem>
                        {transportTypeSelectOptions.map((option) => (
                           <MenuItem key={option.value} value={option.value}>
                              {option.label}
                           </MenuItem>
                        ))}
                     </Select>
                  </FormControl>
               </>
            ) : (
               <>
                  {loadingTypeLabel && (
                     <InfoBadge label="Тип погрузки" value={loadingTypeLabel} />
                  )}

                  {packagingTypeLabel && (
                     <InfoBadge
                        label="Вид упаковки"
                        value={packagingTypeLabel}
                     />
                  )}

                  {compositionTypeLabel && (
                     <InfoBadge
                        label="Тип состава"
                        value={compositionTypeLabel}
                     />
                  )}

                  {transportTypeLabel && (
                     <InfoBadge
                        label="Тип транспорта"
                        value={transportTypeLabel}
                     />
                  )}
               </>
            )}
         </Box>
      </DetailSection>
   );
}

LeadTransportationSection.propTypes = {
   lead: PropTypes.object.isRequired,
   isEditing: PropTypes.bool.isRequired,
   editForm: PropTypes.object.isRequired,
   onEditChange: PropTypes.func.isRequired,
};

import {
   Box,
   FormControl,
   InputLabel,
   MenuItem,
   Select,
} from '@mui/material';
import { useTranslation } from "react-i18next";
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
   const { t } = useTranslation();

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
         title={t("common.fields.transportParams")}
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
                        {t("common.fields.loadingType")}
                     </InputLabel>
                     <Select
                        labelId="lead-loading-type-label"
                        label={t("common.fields.loadingType")}
                        name="loadingType"
                        value={editForm.loadingType || ''}
                        onChange={onEditChange}
                     >
                        <MenuItem value="">{t("common.empty.notSpecifiedM")}</MenuItem>
                        {loadingTypeSelectOptions.map((option) => (
                           <MenuItem key={option.value} value={option.value}>
                              {option.label}
                           </MenuItem>
                        ))}
                     </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                     <InputLabel id="lead-packaging-type-label">
                        {t("common.fields.packagingType")}
                     </InputLabel>
                     <Select
                        labelId="lead-packaging-type-label"
                        label={t("common.fields.packagingType")}
                        name="packagingType"
                        value={editForm.packagingType || ''}
                        onChange={onEditChange}
                     >
                        <MenuItem value="">{t("common.empty.notSpecifiedM")}</MenuItem>
                        {packagingTypeSelectOptions.map((option) => (
                           <MenuItem key={option.value} value={option.value}>
                              {option.label}
                           </MenuItem>
                        ))}
                     </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                     <InputLabel id="lead-composition-type-label">
                        {t("common.fields.bodyType")}
                     </InputLabel>
                     <Select
                        labelId="lead-composition-type-label"
                        label={t("common.fields.bodyType")}
                        name="compositionType"
                        value={editForm.compositionType || ''}
                        onChange={onEditChange}
                     >
                        <MenuItem value="">{t("common.empty.notSpecifiedM")}</MenuItem>
                        {compositionTypeSelectOptions.map((option) => (
                           <MenuItem key={option.value} value={option.value}>
                              {option.label}
                           </MenuItem>
                        ))}
                     </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                     <InputLabel id="lead-transport-type-label">
                        {t("common.fields.transportType")}
                     </InputLabel>
                     <Select
                        labelId="lead-transport-type-label"
                        label={t("common.fields.transportType")}
                        name="transportType"
                        value={editForm.transportType || ''}
                        onChange={onEditChange}
                     >
                        <MenuItem value="">{t("common.empty.notSpecifiedM")}</MenuItem>
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
                     <InfoBadge label={t("common.fields.loadingType")} value={loadingTypeLabel} />
                  )}

                  {packagingTypeLabel && (
                     <InfoBadge
                        label={t("common.fields.packagingType")}
                        value={packagingTypeLabel}
                     />
                  )}

                  {compositionTypeLabel && (
                     <InfoBadge
                        label={t("common.fields.bodyType")}
                        value={compositionTypeLabel}
                     />
                  )}

                  {transportTypeLabel && (
                     <InfoBadge
                        label={t("common.fields.transportType")}
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

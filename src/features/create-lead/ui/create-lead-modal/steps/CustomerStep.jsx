import { Box, TextField } from '@mui/material';
import { useTranslation } from "react-i18next";
import PropTypes from 'prop-types';
import { Controller } from 'react-hook-form';

import { StepSection } from '../components/StepSection';

export function CustomerStep({ control, errors }) {
   const { t } = useTranslation();

   return (
      <StepSection title={t("createLead.steps.customer")}>
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
               name='customer'
               control={control}
               rules={{
                  required: t("createLead.customer.required"),
                  minLength: {
                     value: 3,
                     message: t("validation.min3"),
                  },
               }}
               render={({ field }) => (
                  <TextField
                     {...field}
                     label={t("common.fields.customer")}
                     fullWidth
                     size='small'
                     error={Boolean(errors.customer)}
                     helperText={errors.customer?.message}
                  />
               )}
            />

            <Controller
               name='contactName'
               control={control}
               render={({ field }) => (
                  <TextField
                     {...field}
                     label={t("common.fields.contactPerson")}
                     fullWidth
                     size='small'
                  />
               )}
            />

            <Controller
               name='phone'
               control={control}
               rules={{
                  required: t("validation.phoneRequired"),
                  pattern: {
                     value: /^\+?[0-9\s()-]{10,20}$/,
                     message: t("validation.phone"),
                  },
               }}
               render={({ field }) => (
                  <TextField
                     {...field}
                     label={t("common.fields.phone")}
                     fullWidth
                     size='small'
                     error={Boolean(errors.phone)}
                     helperText={errors.phone?.message}
                  />
               )}
            />
         </Box>
      </StepSection>
   );
}

CustomerStep.propTypes = {
   control: PropTypes.object.isRequired,
   errors: PropTypes.object.isRequired,
};

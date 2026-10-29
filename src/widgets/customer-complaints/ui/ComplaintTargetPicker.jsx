import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from "react-i18next";
import PropTypes from 'prop-types';
import { Autocomplete, TextField } from '@mui/material';

import { fetchComplaintTargets } from '../api/complaints.api';
import { getFactoringTargetLabel, getLeadTargetLabel } from '../model/complaints.helpers';

// Backend's GET /complaints/targets already scopes this to "the user's
// own, last 30 days" leads/factorings — unlike CreateTenderModal's lead
// picker (debounced server search over a potentially large dataset), this
// one is small enough to fetch once and filter/search client-side.
export function ComplaintTargetPicker({ value = null, onChange }) {
   const { t } = useTranslation();

   const [leadOptions, setLeadOptions] = useState([]);
   const [factoringOptions, setFactoringOptions] = useState([]);
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState('');

   useEffect(() => {
      let isCancelled = false;

      async function loadOptions() {
         setIsLoading(true);
         setError('');

         try {
            const response = await fetchComplaintTargets();
            const leads = Array.isArray(response?.leads) ? response.leads : [];
            const factorings = Array.isArray(response?.factorings)
               ? response.factorings
               : [];

            if (!isCancelled) {
               setLeadOptions(
                  leads.map((lead) => ({
                     type: 'lead',
                     id: lead.id,
                     group: t("common.fields.shipments"),
                     label: getLeadTargetLabel(lead),
                  })),
               );

               setFactoringOptions(
                  factorings.map((factoring) => ({
                     type: 'factoring',
                     id: factoring.id,
                     group: t("enums.complaintTarget.factoring"),
                     label: getFactoringTargetLabel(factoring),
                  })),
               );
            }
         } catch (requestError) {
            if (!isCancelled) {
               setError(requestError.message || t("complaints.target.loadFailed"));
            }
         } finally {
            if (!isCancelled) {
               setIsLoading(false);
            }
         }
      }

      loadOptions();

      return () => {
         isCancelled = true;
      };
   }, [t]);

   const options = useMemo(
      () => [...leadOptions, ...factoringOptions],
      [leadOptions, factoringOptions],
   );

   const selectedOption =
      options.find(
         (option) => option.type === value?.type && option.id === value?.id,
      ) ?? null;

   return (
      <Autocomplete
         value={selectedOption}
         options={options}
         loading={isLoading}
         groupBy={(option) => option.group}
         getOptionLabel={(option) => option.label || ''}
         isOptionEqualToValue={(option, optionValue) =>
            option.type === optionValue.type && option.id === optionValue.id
         }
         noOptionsText={t("complaints.target.empty")}
         loadingText={t("common.loading.list")}
         onChange={(_, newValue) => {
            onChange(newValue ? { type: newValue.type, id: newValue.id } : null);
         }}
         renderInput={(params) => (
            <TextField
               {...params}
               label={t("complaints.target.question")}
               placeholder={t("common.empty.optional")}
               error={Boolean(error)}
               helperText={error || t("common.empty.canLeaveBlank")}
            />
         )}
      />
   );
}

ComplaintTargetPicker.propTypes = {
   value: PropTypes.shape({
      type: PropTypes.oneOf(['lead', 'factoring']),
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
   }),
   onChange: PropTypes.func.isRequired,
};

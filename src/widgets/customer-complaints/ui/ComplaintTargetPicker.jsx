import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Autocomplete, TextField } from '@mui/material';

import { fetchCustomerLeads } from '../../customer-leads/api/leads.repository';
import { mockComplaintFactoringRefs } from '../model/complaints.mock';
import {
   getFactoringTargetLabel,
   getLeadTargetLabel,
   isWithinLastDays,
} from '../model/complaints.helpers';

// Unlike CreateTenderModal's lead picker (debounced server search over a
// potentially large dataset), this picker's dataset is small and already
// scoped to "the user's own, last 30 days" — so it's fetched once and
// filtered client-side, no debounced search needed (per spec).
export function ComplaintTargetPicker({ value = null, onChange }) {
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
            const response = await fetchCustomerLeads({ page: 1, perPage: 50 });
            const leads = Array.isArray(response?.results) ? response.results : [];

            if (!isCancelled) {
               setLeadOptions(
                  leads
                     .filter((lead) => isWithinLastDays(lead.created_at))
                     .map((lead) => ({
                        type: 'lead',
                        id: lead.id,
                        group: 'Перевозки',
                        label: getLeadTargetLabel(lead),
                     })),
               );
            }
         } catch (requestError) {
            if (!isCancelled) {
               setError(requestError.message || 'Не удалось загрузить заказы');
            }
         }

         // customer-factorings has no mock-api layer (factorings.api.js
         // always calls the real backend) — this widget uses its own
         // self-contained mock factoring list instead of calling it, so
         // the picker works in the mock-only local/demo environment too.
         if (!isCancelled) {
            setFactoringOptions(
               mockComplaintFactoringRefs
                  .filter((factoring) => isWithinLastDays(factoring.created_at))
                  .map((factoring) => ({
                     type: 'factoring',
                     id: factoring.id,
                     group: 'Факторинг',
                     label: getFactoringTargetLabel(factoring),
                  })),
            );

            setIsLoading(false);
         }
      }

      loadOptions();

      return () => {
         isCancelled = true;
      };
   }, []);

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
         noOptionsText="Нет перевозок или факторингов за последние 30 дней"
         loadingText="Загружаем список..."
         onChange={(_, newValue) => {
            onChange(newValue ? { type: newValue.type, id: newValue.id } : null);
         }}
         renderInput={(params) => (
            <TextField
               {...params}
               label="К какой перевозке или факторингу относится жалоба"
               placeholder="Необязательно"
               error={Boolean(error)}
               helperText={error || 'Можно оставить пустым'}
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

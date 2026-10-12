import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import {
   Box,
   Chip,
   CircularProgress,
   Stack,
   Typography,
} from '@mui/material';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';

import { fetchTaxationRegime } from '../api/kgd-taxation.repository';

export function TaxationRegimeInfo({ role, entityId, label }) {
   const [typeTaxation, setTypeTaxation] = useState(null);
   const [isLoading, setIsLoading] = useState(false);
   const [loadError, setLoadError] = useState('');

   useEffect(() => {
      let isCancelled = false;

      async function loadTaxationRegime() {
         if (!entityId) {
            setTypeTaxation(null);
            return;
         }

         try {
            setIsLoading(true);
            setLoadError('');

            const response = await fetchTaxationRegime(role, entityId);

            if (!isCancelled) {
               setTypeTaxation(response?.data?.typeTaxation ?? null);
            }
         } catch (error) {
            if (!isCancelled) {
               setLoadError(
                  error.response?.data?.message ||
                     error.response?.data?.error ||
                     error.message ||
                     'Не удалось загрузить данные по КГД',
               );
            }
         } finally {
            if (!isCancelled) {
               setIsLoading(false);
            }
         }
      }

      loadTaxationRegime();

      return () => {
         isCancelled = true;
      };
   }, [role, entityId]);

   return (
      <Box
         sx={{
            px: 1.5,
            py: 1,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            backgroundColor: 'grey.50',
         }}
      >
         <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.75 }}>
            <AccountBalanceOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />

            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
               {label}
            </Typography>
         </Stack>

         {isLoading && <CircularProgress size={16} />}

         {!isLoading && loadError && (
            <Typography color="error" sx={{ fontSize: 13 }}>
               {loadError}
            </Typography>
         )}

         {!isLoading && !loadError && (!typeTaxation || typeTaxation.length === 0) && (
            <Typography color="text.secondary" sx={{ fontSize: 14 }}>
               Нет данных
            </Typography>
         )}

         {!isLoading && !loadError && typeTaxation && typeTaxation.length > 0 && (
            <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
               {typeTaxation.map((regime) => (
                  <Chip key={regime} size="small" label={regime} />
               ))}
            </Stack>
         )}
      </Box>
   );
}

TaxationRegimeInfo.propTypes = {
   role: PropTypes.oneOf(['driver', 'forwarder', 'factor', 'customer']).isRequired,
   entityId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
   label: PropTypes.string,
};

TaxationRegimeInfo.defaultProps = {
   entityId: null,
   label: 'Режим налогообложения',
};

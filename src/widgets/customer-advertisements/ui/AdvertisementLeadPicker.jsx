import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from 'react';
import {
   Autocomplete,
   Box,
   CircularProgress,
   Stack,
   TextField,
   Typography,
} from '@mui/material';

import { searchAdvertisementLeads } from '../api/advertisements.repository';
import {
   formatAdvertisementDateTime,
   getAdvertisementLeadNumberLabel,
   getAdvertisementPriceLabel,
} from '../model/advertisement.helpers';

const SEARCH_DEBOUNCE_MS = 400;

function getRouteLabel(lead) {
   const from = String(lead?.fromLocation ?? '').trim();
   const to = String(lead?.toLocation ?? '').trim();

   if (from && to) {
      return `${from} — ${to}`;
   }

   return from || to;
}

function getOptionLabel(option) {
   if (!option) {
      return '';
   }

   return getAdvertisementLeadNumberLabel(option) || getRouteLabel(option);
}

function LeadPreviewRow({ label, value }) {
   return (
      <Stack
         direction={{ xs: 'column', sm: 'row' }}
         spacing={{ xs: 0, sm: 1 }}
         justifyContent="space-between"
      >
         <Typography variant="body2" color="text.secondary">
            {label}
         </Typography>

         <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {value}
         </Typography>
      </Stack>
   );
}

LeadPreviewRow.propTypes = {
   label: PropTypes.string.isRequired,
   value: PropTypes.node.isRequired,
};

export function AdvertisementLeadPicker({ selectedLead, onSelectLead }) {
   const { t } = useTranslation();

   const [inputValue, setInputValue] = useState('');
   const [debouncedQuery, setDebouncedQuery] = useState('');
   const [options, setOptions] = useState([]);
   const [isLoading, setIsLoading] = useState(false);
   const [searchError, setSearchError] = useState('');

   const selectedLabel = selectedLead ? getOptionLabel(selectedLead) : '';

   useEffect(() => {
      const timeoutId = setTimeout(() => {
         setDebouncedQuery(inputValue.trim());
      }, SEARCH_DEBOUNCE_MS);

      return () => clearTimeout(timeoutId);
   }, [inputValue]);

   useEffect(() => {
      if (selectedLabel && debouncedQuery === selectedLabel) {
         return undefined;
      }

      let isCancelled = false;

      async function loadLeads() {
         try {
            setIsLoading(true);
            setSearchError('');

            const results = await searchAdvertisementLeads({
               q: debouncedQuery,
            });

            if (!isCancelled) {
               setOptions(Array.isArray(results) ? results : []);
            }
         } catch (requestError) {
            if (!isCancelled) {
               setSearchError(
                  requestError.message ||
                     t('advertisements.pickLead.searchFailed'),
               );
            }
         } finally {
            if (!isCancelled) {
               setIsLoading(false);
            }
         }
      }

      loadLeads();

      return () => {
         isCancelled = true;
      };
   }, [debouncedQuery, selectedLabel, t]);

   const previewRows = useMemo(() => {
      if (!selectedLead) {
         return [];
      }

      return [
         {
            label: t('advertisements.fields.leadNum'),
            value: getAdvertisementLeadNumberLabel(selectedLead),
         },
         {
            label: t('advertisements.fields.route'),
            value: getRouteLabel(selectedLead),
         },
         {
            label: t('common.fields.cargo'),
            value: selectedLead.cargo,
         },
         {
            label: t('advertisements.fields.firstPointAt'),
            value: formatAdvertisementDateTime(selectedLead.firstPointAt),
         },
         {
            label: t('common.fields.price'),
            value: getAdvertisementPriceLabel(selectedLead),
         },
         {
            label: t('common.fields.createdAt'),
            value: formatAdvertisementDateTime(selectedLead.createdAt),
         },
         {
            label: t('common.fields.phone'),
            value: selectedLead.contacts?.phone,
         },
         {
            label: t('common.fields.email'),
            value: selectedLead.contacts?.email,
         },
      ].filter((row) => Boolean(row.value));
   }, [selectedLead, t]);

   return (
      <Stack spacing={2.5}>
         <Autocomplete
            value={selectedLead}
            onChange={(_, newValue) => onSelectLead(newValue)}
            inputValue={inputValue}
            onInputChange={(_, newInputValue, reason) => {
               if (reason === 'reset') {
                  return;
               }

               setInputValue(newInputValue);
            }}
            options={options}
            getOptionLabel={getOptionLabel}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            loading={isLoading}
            filterOptions={(items) => items}
            noOptionsText={t('advertisements.pickLead.empty')}
            loadingText={t('advertisements.pickLead.loading')}
            renderOption={(optionProps, option) => {
               const { key, ...listItemProps } = optionProps;

               const routeLabel = getRouteLabel(option);
               const priceLabel = getAdvertisementPriceLabel(option);
               const firstPointLabel = formatAdvertisementDateTime(
                  option.firstPointAt,
               );
               const metaLabel = [option.cargo, firstPointLabel]
                  .filter(Boolean)
                  .join(' · ');

               return (
                  <Box
                     key={key}
                     component="li"
                     {...listItemProps}
                     sx={{ display: 'block !important', py: 1.25 }}
                  >
                     <Stack
                        direction="row"
                        justifyContent="space-between"
                        spacing={1.5}
                        alignItems="center"
                     >
                        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                           {getAdvertisementLeadNumberLabel(option) || '—'}
                        </Typography>

                        {priceLabel && (
                           <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                              {priceLabel}
                           </Typography>
                        )}
                     </Stack>

                     {routeLabel && (
                        <Typography
                           sx={{ fontSize: 13 }}
                           color="text.secondary"
                           noWrap
                        >
                           {routeLabel}
                        </Typography>
                     )}

                     {metaLabel && (
                        <Typography
                           sx={{ fontSize: 12 }}
                           color="text.secondary"
                        >
                           {metaLabel}
                        </Typography>
                     )}
                  </Box>
               );
            }}
            renderInput={(params) => {
               const inputSlotProps = params.slotProps?.input ?? {};

               return (
                  <TextField
                     {...params}
                     label={t('advertisements.pickLead.label')}
                     placeholder={t('advertisements.pickLead.placeholder')}
                     error={Boolean(searchError)}
                     helperText={
                        searchError || t('advertisements.pickLead.hint')
                     }
                     slotProps={{
                        ...params.slotProps,
                        input: {
                           ...inputSlotProps,
                           endAdornment: (
                              <>
                                 {isLoading && (
                                    <CircularProgress
                                       color="inherit"
                                       size={18}
                                    />
                                 )}

                                 {inputSlotProps.endAdornment}
                              </>
                           ),
                        },
                     }}
                  />
               );
            }}
         />

         {selectedLead && (
            <Box
               sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  backgroundColor: 'background.paper',
               }}
            >
               <Typography sx={{ fontWeight: 600, mb: 1.5 }}>
                  {t('advertisements.pickLead.selected')}
               </Typography>

               <Stack spacing={1}>
                  {previewRows.map((row) => (
                     <LeadPreviewRow
                        key={row.label}
                        label={row.label}
                        value={row.value}
                     />
                  ))}
               </Stack>
            </Box>
         )}
      </Stack>
   );
}

AdvertisementLeadPicker.propTypes = {
   selectedLead: PropTypes.object,
   onSelectLead: PropTypes.func.isRequired,
};

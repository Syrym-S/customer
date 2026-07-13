import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import {
   Autocomplete,
   Box,
   Chip,
   CircularProgress,
   TextField,
   Typography,
} from '@mui/material';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';

import { DetailSection } from '../components/DetailSection';
import { InfoBadge } from '../components/InfoBadge';
import { fetchForwardersApi } from '../../../../../features/create-lead/api/forwarders.api';
import { FORWARDERS_PER_PAGE } from '../../../../customer-forwarders/model/forwarders.helpers';

function normalizeForwarderOption(forwarder) {
   if (!forwarder) {
      return null;
   }

   return {
      id: forwarder.id,

      fullName:
         forwarder.fullName ||
         forwarder.full_name ||
         forwarder.fio ||
         forwarder.name ||
         'Без имени',

      iin: forwarder.iin || forwarder.personIin || '',

      companyName:
         forwarder.companyName ||
         forwarder.company_name ||
         forwarder.name ||
         'Без компании',

      companyBin:
         forwarder.companyBin || forwarder.company_bin || forwarder.bin || '',

      phone: forwarder.phone || forwarder.tel || '',

      raw: forwarder.raw || forwarder,
   };
}

function getForwardersFromResponse(response) {
   const data = response?.data ?? response;

   if (Array.isArray(data)) {
      return data;
   }

   if (Array.isArray(data?.results)) {
      return data.results;
   }

   if (Array.isArray(data?.data?.results)) {
      return data.data.results;
   }

   if (Array.isArray(data?.data)) {
      return data.data;
   }

   return [];
}

function normalizeForwardersOptions(response) {
   return getForwardersFromResponse(response)
      .map(normalizeForwarderOption)
      .filter((forwarder) => forwarder?.id);
}

function getForwarderLabel(forwarder) {
   return (
      forwarder?.companyName ||
      forwarder?.company_name ||
      forwarder?.name ||
      forwarder?.fullName ||
      forwarder?.full_name ||
      forwarder?.fio ||
      ''
   );
}

function getForwarderSearchText(forwarder) {
   return [
      forwarder.fullName,
      forwarder.companyName,
      forwarder.companyBin,
      forwarder.iin,
      forwarder.phone,
   ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
}

function filterForwardersLocally(forwarders, query) {
   const normalizedQuery = query.trim().toLowerCase();

   if (!normalizedQuery) {
      return forwarders;
   }

   return forwarders.filter((forwarder) =>
      getForwarderSearchText(forwarder).includes(normalizedQuery),
   );
}

export function LeadForwarderSection({
   lead,
   isEditing,
   editForm,
   onEditChange,
}) {
   const forwarder = lead.forwarder;

   const [inputValue, setInputValue] = useState('');
   const [allForwarders, setAllForwarders] = useState([]);
   const [isForwardersLoaded, setIsForwardersLoaded] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [searchError, setSearchError] = useState(null);

   const selectedForwarder = useMemo(
      () => normalizeForwarderOption(editForm.forwarderData),
      [editForm.forwarderData],
   );

   const loadForwarders = useCallback(async () => {
      if (!isEditing || isForwardersLoaded || isLoading) {
         return;
      }

      try {
         setIsLoading(true);
         setSearchError(null);

         const response = await fetchForwardersApi({
            page: 1,
            perPage: FORWARDERS_PER_PAGE,
         });

         setAllForwarders(normalizeForwardersOptions(response));
         setIsForwardersLoaded(true);
      } catch (error) {
         setSearchError(
            error.response?.data?.message ||
               error.response?.data?.error ||
               error.message ||
               'Не удалось загрузить экспедиторов',
         );

         setAllForwarders([]);
      } finally {
         setIsLoading(false);
      }
   }, [isEditing, isForwardersLoaded, isLoading]);

   useEffect(() => {
      if (!isEditing) {
         setInputValue('');
         setAllForwarders([]);
         setSearchError(null);
         setIsForwardersLoaded(false);
         return;
      }

      setInputValue(getForwarderLabel(selectedForwarder));
   }, [isEditing, selectedForwarder]);

   const options = useMemo(() => {
      const selectedLabel = getForwarderLabel(selectedForwarder);

      const shouldShowFullList =
         !inputValue.trim() ||
         (selectedLabel && inputValue.trim() === selectedLabel.trim());

      const filteredForwarders = shouldShowFullList
         ? allForwarders
         : filterForwardersLocally(allForwarders, inputValue);

      if (
         selectedForwarder &&
         !filteredForwarders.some((item) => item.id === selectedForwarder.id)
      ) {
         return [selectedForwarder, ...filteredForwarders];
      }

      return filteredForwarders;
   }, [allForwarders, inputValue, selectedForwarder]);

   return (
      <DetailSection icon={<BusinessOutlinedIcon />} title="Экспедитор">
         {isEditing ? (
            <Autocomplete
               value={selectedForwarder}
               inputValue={inputValue}
               options={options}
               loading={isLoading}
               filterOptions={(items) => items}
               getOptionLabel={getForwarderLabel}
               isOptionEqualToValue={(option, value) =>
                  option?.id === value?.id
               }
               onOpen={loadForwarders}
               noOptionsText={
                  isForwardersLoaded
                     ? 'Экспедитор не найден'
                     : 'Нажмите, чтобы загрузить экспедиторов'
               }
               loadingText="Загружаем экспедиторов..."
               onInputChange={(_, newInputValue, reason) => {
                  if (reason === 'reset') {
                     return;
                  }

                  setInputValue(newInputValue);
               }}
               onChange={(_, nextForwarder) => {
                  const normalizedForwarder =
                     normalizeForwarderOption(nextForwarder);

                  onEditChange('forwarder', normalizedForwarder?.id || '');
                  onEditChange('forwarderData', normalizedForwarder || null);

                  setInputValue(getForwarderLabel(normalizedForwarder));
                  setSearchError(null);
               }}
               renderOption={(optionProps, option) => {
                  const { key, ...listItemProps } = optionProps;

                  return (
                     <Box
                        key={key}
                        component="li"
                        {...listItemProps}
                        sx={{
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'space-between',
                           gap: 2,
                           py: 1.2,
                        }}
                     >
                        <Box>
                           <Typography fontWeight={700}>
                              {option.fullName || 'Без имени'}
                           </Typography>

                           <Typography fontSize={12} color="text.secondary">
                              БИН: {option.companyBin || '—'}
                           </Typography>
                        </Box>

                        <Chip
                           size="small"
                           label={option.companyName || 'Без компании'}
                           sx={{
                              height: 22,
                              fontSize: '0.7rem',
                              fontWeight: 500,
                           }}
                        />
                     </Box>
                  );
               }}
               renderInput={(params) => {
                  const inputProps = params.InputProps ?? {};

                  return (
                     <TextField
                        {...params}
                        label="Экспедитор"
                        placeholder="Введите название компании или БИН"
                        error={Boolean(searchError)}
                        helperText={searchError}
                        size="small"
                        fullWidth
                        onFocus={loadForwarders}
                        InputProps={{
                           ...inputProps,
                           endAdornment: (
                              <>
                                 {isLoading && (
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
         ) : (
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
               <InfoBadge
                  label="ФИО"
                  value={forwarder?.fullName || 'Не указан'}
               />

               <InfoBadge
                  label="Компания"
                  value={forwarder?.companyName || 'Не указано'}
               />

               <InfoBadge
                  label="БИН"
                  value={forwarder?.companyBin || 'Не указан'}
               />

               <InfoBadge
                  label="Телефон"
                  value={forwarder?.phone || 'Не указан'}
               />
            </Box>
         )}
      </DetailSection>
   );
}

LeadForwarderSection.propTypes = {
   lead: PropTypes.shape({
      forwarder: PropTypes.shape({
         id: PropTypes.string,
         fullName: PropTypes.string,
         companyName: PropTypes.string,
         companyBin: PropTypes.string,
         phone: PropTypes.string,
      }),
   }).isRequired,
   isEditing: PropTypes.bool.isRequired,
   editForm: PropTypes.shape({
      forwarder: PropTypes.string,
      forwarderData: PropTypes.object,
   }).isRequired,
   onEditChange: PropTypes.func.isRequired,
};

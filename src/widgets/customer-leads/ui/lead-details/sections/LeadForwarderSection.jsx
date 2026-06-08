import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import { Autocomplete, Box, CircularProgress, TextField } from '@mui/material';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';

import { searchForwarders } from '../../../../../features/create-lead/api/forwarders.repository';
import { DetailSection } from '../components/DetailSection';
import { InfoBadge } from '../components/InfoBadge';

export function LeadForwarderSection({
   lead,
   isEditing,
   editForm,
   onEditChange,
}) {
   const forwarder = lead.forwarder;

   const [inputValue, setInputValue] = useState('');
   const [forwarders, setForwarders] = useState([]);
   const [isLoading, setIsLoading] = useState(false);
   const [searchError, setSearchError] = useState(null);

   const selectedForwarder = editForm.forwarderData ?? null;
   const isOptionSelectedRef = useRef(false);

   function getForwarderLabel(forwarder) {
      return forwarder?.companyName || forwarder?.fullName || '';
   }

   useEffect(() => {
      if (!isEditing) {
         setInputValue('');
         setForwarders([]);
         setSearchError(null);
         return;
      }

      setInputValue(getForwarderLabel(selectedForwarder));
      setForwarders(selectedForwarder ? [selectedForwarder] : []);
   }, [isEditing, selectedForwarder]);

   useEffect(() => {
      if (!isEditing) {
         return;
      }

      if (isOptionSelectedRef.current) {
         isOptionSelectedRef.current = false;
         return;
      }

      const query = inputValue.trim();

      if (query.length < 2) {
         setForwarders(selectedForwarder ? [selectedForwarder] : []);
         setSearchError(null);
         return;
      }

      let isCancelled = false;

      const timeoutId = setTimeout(async () => {
         try {
            setIsLoading(true);
            setSearchError(null);

            const result = await searchForwarders(query);

            if (!isCancelled) {
               setForwarders(result);
            }
         } catch (error) {
            if (!isCancelled) {
               setSearchError(error.message || 'Не удалось найти экспедиторов');
               setForwarders([]);
            }
         } finally {
            if (!isCancelled) {
               setIsLoading(false);
            }
         }
      }, 300);

      return () => {
         isCancelled = true;
         clearTimeout(timeoutId);
      };
   }, [inputValue, isEditing, selectedForwarder]);

   const options = useMemo(() => {
      if (
         selectedForwarder &&
         !forwarders.some((item) => item.id === selectedForwarder.id)
      ) {
         return [selectedForwarder, ...forwarders];
      }

      return forwarders;
   }, [forwarders, selectedForwarder]);

   return (
      <DetailSection icon={<BusinessOutlinedIcon />} title='Экспедитор'>
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
               noOptionsText={
                  inputValue.trim().length < 2
                     ? 'Введите минимум 2 символа'
                     : 'Экспедитор не найден'
               }
               loadingText='Поиск экспедиторов...'
               onInputChange={(_, newInputValue, reason) => {
                  if (reason === 'reset') {
                     return;
                  }

                  setInputValue(newInputValue);
               }}
               onChange={(_, nextForwarder) => {
                  onEditChange('forwarder', nextForwarder?.id || '');
                  onEditChange('forwarderData', nextForwarder || null);

                  setInputValue(getForwarderLabel(nextForwarder));
                  setForwarders(nextForwarder ? [nextForwarder] : []);
                  isOptionSelectedRef.current = true;
                  setSearchError(null);
               }}
               renderInput={(params) => {
                  const inputProps = params.InputProps ?? {};

                  return (
                     <TextField
                        {...params}
                        label='Экспедитор'
                        placeholder='Введите название компании или БИН'
                        error={Boolean(searchError)}
                        helperText={searchError}
                        size='small'
                        fullWidth
                        InputProps={{
                           ...inputProps,
                           endAdornment: (
                              <>
                                 {isLoading && (
                                    <CircularProgress
                                       color='inherit'
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
                  label='ФИО'
                  value={forwarder?.fullName || 'Не указан'}
               />

               <InfoBadge
                  label='Компания'
                  value={forwarder?.companyName || 'Не указано'}
               />

               <InfoBadge
                  label='БИН'
                  value={forwarder?.companyBin || 'Не указан'}
               />

               <InfoBadge
                  label='Телефон'
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

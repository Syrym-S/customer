import {
   Alert,
   Autocomplete,
   Box,
   Button,
   Checkbox,
   Chip,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   FormControl,
   FormControlLabel,
   InputLabel,
   MenuItem,
   Select,
   Stack,
   TextField,
   Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useTendersContext } from '../model/useTendersContext';
import { useEffect, useMemo, useState } from 'react';
import { searchTenderLeadsApi } from '../api/tender.api';
import { getCurrentDateTimeForTenderApi } from '../model/tender.helpers';
import { searchForwardersApi } from '../../../features/create-lead/api/forwarders.api';

const INITIAL_FORM = {
   endDateTime: '',
   isPublic: true,
   maxParticipants: 0,
   startAfterCreate: false,
};

function formatDateTimeForTenderApi(value) {
   if (!value) {
      return '';
   }

   return `${value.replace('T', ' ')}:00`;
}

function formatMoney(value) {
   if (value === null || value === undefined || value === '') {
      return 'Цена не указана';
   }

   return `${Number(value).toLocaleString('ru-RU')} KZT`;
}

export function CreateTenderModal({ open, onClose }) {
   const { createTender, addParticipant, reloadTenders, startTender } =
      useTendersContext();

   const [form, setForm] = useState(INITIAL_FORM);

   const [leadInputValue, setLeadInputValue] = useState('');
   const [selectedLead, setSelectedLead] = useState(null);
   const [leads, setLeads] = useState([]);
   const [isLeadsLoading, setIsLeadsLoading] = useState(false);
   const [leadsSearchError, setLeadsSearchError] = useState('');

   const [selectedForwarders, setSelectedForwarders] = useState([]);
   const [forwarderInputValue, setForwarderInputValue] = useState('');
   const [forwarders, setForwarders] = useState([]);
   const [isForwardersLoading, setIsForwardersLoading] = useState(false);
   const [forwardersSearchError, setForwardersSearchError] = useState('');

   const [submitError, setSubmitError] = useState('');
   const [isSubmitting, setIsSubmitting] = useState(false);

   const leadOptions = useMemo(() => {
      if (selectedLead && !leads.some((lead) => lead.id === selectedLead.id)) {
         return [selectedLead, ...leads];
      }

      return leads;
   }, [leads, selectedLead]);

   const forwarderOptions = useMemo(() => {
      const selectedIds = new Set(
         selectedForwarders.map((forwarder) => forwarder.id),
      );

      const uniqueForwarders = forwarders.filter(
         (forwarder) => !selectedIds.has(forwarder.id),
      );

      return [...selectedForwarders, ...uniqueForwarders];
   }, [forwarders, selectedForwarders]);

   function handleFieldChange(field, value) {
      setForm((prevForm) => ({
         ...prevForm,
         [field]: value,
      }));
   }

   function validateForm() {
      if (!selectedLead?.id) {
         return 'Выберите лид';
      }

      if (!form.endDateTime) {
         return 'Укажите дату окончания';
      }

      const endDate = new Date(form.endDateTime);
      const now = new Date();

      if (Number.isNaN(endDate.getTime())) {
         return 'Некорректная дата окончания';
      }

      if (endDate <= now) {
         return 'Дата окончания должна быть позже текущего времени';
      }

      if (form.isPublic) {
         const maxParticipants = Number(form.maxParticipants);

         if (Number.isNaN(maxParticipants) || maxParticipants < 0) {
            return 'Максимальное количество участников не может быть меньше 0';
         }
      }

      if (!form.isPublic && selectedForwarders.length === 0) {
         return 'Выберите хотя бы одного экспедитора для приватного тендера';
      }

      return '';
   }

   async function handleSubmit(event) {
      event.preventDefault();

      const validationError = validateForm();

      if (validationError) {
         setSubmitError(validationError);
         return;
      }

      try {
         setIsSubmitting(true);
         setSubmitError('');

         const isPublicTender = form.isPublic;

         const payload = {
            lead_id: selectedLead.id,
            public_date_time: getCurrentDateTimeForTenderApi(),
            end_date_time: formatDateTimeForTenderApi(form.endDateTime),
            type: 'forwarder',
            publication_type: isPublicTender ? 'public' : 'private',
            max_participants: isPublicTender
               ? Number(form.maxParticipants) || 0
               : 0,
         };

         const createdTender = await createTender(payload);

         console.log('created tender:', createdTender);

         if (!isPublicTender) {
            await Promise.all(
               selectedForwarders.map((forwarder) =>
                  addParticipant(createdTender.id, forwarder.id),
               ),
            );
         }

         if (form.startAfterCreate) {
            await startTender(createdTender.id);
         } else {
            await reloadTenders();
         }
         onClose();
      } catch (error) {
         setSubmitError(
            error.response?.data?.message ||
               error.message ||
               'Не удалось создать тендер',
         );
      } finally {
         setIsSubmitting(false);
      }
   }

   useEffect(() => {
      const query = leadInputValue.trim();

      if (query.length < 2) {
         setLeads([]);
         setLeadsSearchError('');
         return;
      }

      let isCancelled = false;

      const timeoutId = setTimeout(async () => {
         try {
            setIsLeadsLoading(true);
            setLeadsSearchError('');

            const response = await searchTenderLeadsApi({
               q: query,
               page: 1,
               perPage: 10,
            });

            if (!isCancelled) {
               setLeads(response.results);
            }
         } catch (error) {
            if (!isCancelled) {
               setLeads([]);
               setLeadsSearchError(
                  error.response?.data?.message ||
                     error.message ||
                     'Не удалось найти лиды',
               );
            }
         } finally {
            if (!isCancelled) {
               setIsLeadsLoading(false);
            }
         }
      }, 300);

      return () => {
         isCancelled = true;
         clearTimeout(timeoutId);
      };
   }, [leadInputValue]);

   useEffect(() => {
      if (form.isPublic) {
         setForwarders([]);
         setForwardersSearchError('');
         return;
      }

      const query = forwarderInputValue.trim();

      if (query.length < 2) {
         setForwarders([]);
         setForwardersSearchError('');
         return;
      }

      let isCancelled = false;

      const timeoutId = setTimeout(async () => {
         try {
            setIsForwardersLoading(true);
            setForwardersSearchError('');

            const result = await searchForwardersApi(query);

            if (!isCancelled) {
               setForwarders(result);
            }
         } catch (error) {
            if (!isCancelled) {
               setForwarders([]);
               setForwardersSearchError(
                  error.response?.data?.message ||
                     error.message ||
                     'Не удалось найти экспедиторов',
               );
            }
         } finally {
            if (!isCancelled) {
               setIsForwardersLoading(false);
            }
         }
      }, 300);

      return () => {
         isCancelled = true;
         clearTimeout(timeoutId);
      };
   }, [form.isPublic, forwarderInputValue]);

   return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
         <DialogTitle>Создание тендера</DialogTitle>

         <DialogContent>
            <Box component='form' onSubmit={handleSubmit} sx={{ pt: 1 }}>
               <Stack spacing={2.5}>
                  {submitError && <Alert severity='error'>{submitError}</Alert>}

                  <Autocomplete
                     value={selectedLead}
                     inputValue={leadInputValue}
                     options={leadOptions}
                     loading={isLeadsLoading}
                     filterOptions={(items) => items}
                     getOptionLabel={(option) =>
                        option?.label || option?.id || ''
                     }
                     isOptionEqualToValue={(option, value) =>
                        option?.id === value?.id
                     }
                     noOptionsText={
                        leadInputValue.trim().length < 2
                           ? 'Введите минимум 2 символа'
                           : 'Лиды не найдены'
                     }
                     loadingText='Поиск лидов...'
                     onInputChange={(_, newInputValue, reason) => {
                        if (reason === 'reset') {
                           return;
                        }

                        setLeadInputValue(newInputValue);
                     }}
                     onChange={(_, newValue) => {
                        setSelectedLead(newValue);
                        setLeadInputValue('');
                     }}
                     renderOption={(optionProps, option) => {
                        const { key, ...listItemProps } = optionProps;

                        return (
                           <Box
                              key={key}
                              component='li'
                              {...listItemProps}
                              sx={{
                                 display: 'flex',
                                 flexDirection: 'column',
                                 alignItems: 'flex-start',
                                 gap: 0.5,
                                 py: 1.2,
                              }}
                           >
                              <Typography fontWeight={700}>
                                 {option.cargo || 'Груз не указан'}
                              </Typography>

                              <Typography
                                 color='text.secondary'
                                 sx={{ fontSize: 13 }}
                              >
                                 Куда: {option.to || 'Не указано'}
                              </Typography>

                              <Box
                                 sx={{
                                    display: 'flex',
                                    gap: 1,
                                    flexWrap: 'wrap',
                                    mt: 0.5,
                                 }}
                              >
                                 {option.status && (
                                    <Chip
                                       size='small'
                                       label={option.status}
                                       sx={{ height: 22 }}
                                    />
                                 )}

                                 <Chip
                                    size='small'
                                    label={formatMoney(option.price)}
                                    sx={{ height: 22 }}
                                 />
                              </Box>
                           </Box>
                        );
                     }}
                     renderInput={(params) => (
                        <TextField
                           {...params}
                           label='Лид'
                           placeholder='Введите город, груз или направление'
                           error={Boolean(leadsSearchError)}
                           helperText={
                              leadsSearchError ||
                              'Выберите лид, для которого создаётся тендер'
                           }
                        />
                     )}
                  />

                  <TextField
                     label='Дата окончания'
                     type='datetime-local'
                     value={form.endDateTime}
                     onChange={(event) =>
                        handleFieldChange('endDateTime', event.target.value)
                     }
                     slotProps={{
                        inputLabel: {
                           shrink: true,
                        },
                     }}
                     fullWidth
                  />

                  <FormControlLabel
                     control={
                        <Checkbox
                           checked={form.isPublic}
                           onChange={(event) => {
                              const isPublic = event.target.checked;

                              handleFieldChange('isPublic', isPublic);

                              if (isPublic) {
                                 setSelectedForwarders([]);
                                 setForwarderInputValue('');
                                 setForwarders([]);
                                 setForwardersSearchError('');
                              }
                           }}
                        />
                     }
                     label='Публичный тендер'
                  />

                  {form.isPublic && (
                     <TextField
                        label='Максимум участников'
                        type='number'
                        value={form.maxParticipants}
                        onChange={(event) =>
                           handleFieldChange(
                              'maxParticipants',
                              event.target.value,
                           )
                        }
                        helperText='0 — без лимита'
                        slotProps={{
                           htmlInput: {
                              min: 0,
                           },
                        }}
                        fullWidth
                     />
                  )}

                  <FormControlLabel
                     control={
                        <Checkbox
                           checked={Boolean(form.startAfterCreate)}
                           onChange={(event) =>
                              handleFieldChange(
                                 'startAfterCreate',
                                 event.target.checked,
                              )
                           }
                        />
                     }
                     label='Запустить тендер после создания'
                  />

                  {!form.isPublic && (
                     <Autocomplete
                        multiple
                        value={selectedForwarders}
                        inputValue={forwarderInputValue}
                        options={forwarderOptions}
                        loading={isForwardersLoading}
                        filterOptions={(items) => items}
                        getOptionLabel={(option) => option?.fullName ?? ''}
                        isOptionEqualToValue={(option, value) =>
                           option?.id === value?.id
                        }
                        noOptionsText={
                           forwarderInputValue.trim().length < 2
                              ? 'Введите минимум 2 символа'
                              : 'Экспедитор не найден'
                        }
                        loadingText='Поиск экспедиторов...'
                        filterSelectedOptions
                        onInputChange={(_, newInputValue, reason) => {
                           if (reason === 'reset') {
                              return;
                           }

                           setForwarderInputValue(newInputValue);
                        }}
                        onChange={(_, newValue) => {
                           setSelectedForwarders(newValue);
                           setForwarderInputValue('');
                        }}
                        renderValue={(tagValue, getItemProps) =>
                           tagValue.map((option, index) => {
                              const { key, ...itemProps } = getItemProps({
                                 index,
                              });

                              return (
                                 <Chip
                                    key={key}
                                    label={
                                       option.fullName ||
                                       option.companyName ||
                                       option.id
                                    }
                                    {...itemProps}
                                    sx={{
                                       maxWidth: '100%',
                                       height: 28,
                                       fontSize: '0.8rem',
                                       fontWeight: 700,
                                       bgcolor: 'primary.main',
                                       color: 'primary.contrastText',
                                       borderRadius: '10px',

                                       '& .MuiChip-deleteIcon': {
                                          color: 'primary.contrastText',
                                          opacity: 0.85,
                                          fontSize: 18,
                                       },

                                       '& .MuiChip-deleteIcon:hover': {
                                          color: 'primary.contrastText',
                                          opacity: 1,
                                       },
                                    }}
                                 />
                              );
                           })
                        }
                        renderOption={(optionProps, option) => {
                           const { key, ...listItemProps } = optionProps;

                           return (
                              <Box
                                 key={key}
                                 component='li'
                                 {...listItemProps}
                                 sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 2,
                                    py: 1.2,
                                 }}
                              >
                                 <Box sx={{ minWidth: 0 }}>
                                    <Typography fontWeight={700}>
                                       {option.fullName || 'ФИО не указано'}
                                    </Typography>

                                    <Typography
                                       color='text.secondary'
                                       sx={{ fontSize: 12 }}
                                    >
                                       {option.phone ||
                                          option.iin ||
                                          'Контакты не указаны'}
                                    </Typography>
                                 </Box>

                                 {option.companyName && (
                                    <Chip
                                       size='small'
                                       label={option.companyName}
                                       sx={{
                                          height: 22,
                                          fontSize: '0.7rem',
                                          fontWeight: 500,
                                       }}
                                    />
                                 )}
                              </Box>
                           );
                        }}
                        renderInput={(params) => (
                           <TextField
                              {...params}
                              label='Экспедиторы'
                              placeholder={
                                 selectedForwarders.length > 0
                                    ? ''
                                    : 'Введите ФИО, ИИН, компанию, БИН или телефон'
                              }
                              error={Boolean(forwardersSearchError)}
                              helperText={
                                 forwardersSearchError ||
                                 'Выберите экспедиторов, которые будут приглашены в приватный тендер'
                              }
                           />
                        )}
                     />
                  )}
               </Stack>
            </Box>
         </DialogContent>

         <DialogActions>
            <Button
               variant='contained'
               onClick={handleSubmit}
               disabled={isSubmitting}
            >
               {isSubmitting ? 'Создаём...' : 'Создать тендер'}
            </Button>
         </DialogActions>
      </Dialog>
   );
}

CreateTenderModal.propTypes = {
   open: PropTypes.bool.isRequired,
   onClose: PropTypes.func.isRequired,
};

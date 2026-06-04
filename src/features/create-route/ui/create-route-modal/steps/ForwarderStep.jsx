import {
   Autocomplete,
   Box,
   Chip,
   Stack,
   TextField,
   Typography,
   createFilterOptions,
} from '@mui/material';
import { Controller } from 'react-hook-form';

import { forwardersMock } from '../../../model/forwarders.mock';
import { StepSection } from '../components/StepSection';
import { InfoBadge } from '../components/InfoBadge';
import PropTypes from 'prop-types';

const filterForwarders = createFilterOptions({
   stringify: (option) =>
      `${option.fullName} ${option.iin} ${option.companyName} ${option.companyBin} ${option.phone}`,
});

export function ForwarderStep({ control, errors }) {
   return (
      <StepSection
         title='Выбор экспедитора'
         description='Найдите и выберите экспедитора, который будет закреплен за маршрутом'
      >
         <Controller
            name='forwarderId'
            control={control}
            rules={{ required: 'Выберите экспедитора' }}
            render={({ field }) => {
               const selectedForwarder =
                  forwardersMock.find(
                     (forwarder) => forwarder.id === field.value,
                  ) ?? null;

               return (
                  <Stack spacing={2}>
                     <Autocomplete
                        multiple
                        value={selectedForwarder ? [selectedForwarder] : []}
                        options={forwardersMock}
                        filterOptions={filterForwarders}
                        getOptionLabel={(option) => option?.fullName ?? ''}
                        isOptionEqualToValue={(option, value) =>
                           option.id === value.id
                        }
                        noOptionsText='Экспедитор не найден'
                        filterSelectedOptions
                        onChange={(_, newValue) => {
                           const lastSelectedForwarder =
                              newValue.at(-1) ?? null;

                           field.onChange(lastSelectedForwarder?.id ?? '');
                        }}
                        renderValue={(tagValue, getItemProps) =>
                           tagValue.map((option, index) => {
                              const { key, ...itemProps } = getItemProps({
                                 index,
                              });

                              return (
                                 <Chip
                                    key={key}
                                    label={option.fullName}
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
                                 <Typography fontWeight={700}>
                                    {option.fullName}
                                 </Typography>

                                 <Chip
                                    size='small'
                                    label={option.companyName}
                                    sx={{
                                       height: 22,
                                       fontSize: '0.7rem',
                                       fontWeight: 500,
                                    }}
                                 />
                              </Box>
                           );
                        }}
                        renderInput={(params) => (
                           <TextField
                              {...params}
                              label='Экспедитор'
                              placeholder={
                                 selectedForwarder
                                    ? ''
                                    : 'Введите ФИО, ИИН, компанию, БИН или телефон'
                              }
                              error={Boolean(errors.forwarderId)}
                              helperText={errors.forwarderId?.message}
                           />
                        )}
                     />

                     {selectedForwarder && (
                        <Box
                           sx={{
                              display: 'grid',
                              gridTemplateColumns: {
                                 xs: '1fr',
                                 sm: 'repeat(2, 1fr)',
                              },
                              gap: 1.5,
                           }}
                        >
                           <InfoBadge
                              label='ФИО экспедитора'
                              value={selectedForwarder.fullName}
                           />
                           <InfoBadge
                              label='ИИН экспедитора'
                              value={selectedForwarder.iin}
                           />
                           <InfoBadge
                              label='Компания'
                              value={selectedForwarder.companyName}
                           />
                           <InfoBadge
                              label='БИН компании'
                              value={selectedForwarder.companyBin}
                           />
                           <InfoBadge
                              label='Телефон'
                              value={selectedForwarder.phone}
                           />
                        </Box>
                     )}
                  </Stack>
               );
            }}
         />
      </StepSection>
   );
}

ForwarderStep.propTypes = {
   control: PropTypes.object.isRequired,
   errors: PropTypes.object.isRequired,
};

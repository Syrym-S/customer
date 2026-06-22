import { useEffect, useMemo, useState } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import PropTypes from 'prop-types';
import {
    Autocomplete,
    Box,
    Chip,
    CircularProgress,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

import { searchForwarders } from '../../../api/forwarders.repository';
import { InfoBadge } from '../components/InfoBadge';
import { StepSection } from '../components/StepSection';
import { fetchForwarderById } from '../../../api/forwarders.api';

export function ForwarderStep({ control, errors, setValue }) {
    const selectedForwarderId = useWatch({
        control,
        name: 'forwarderId',
    });

    const [inputValue, setInputValue] = useState('');
    const [forwarders, setForwarders] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [selectedForwarder, setSelectedForwarder] = useState(null);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);

    useEffect(() => {
        if (!selectedForwarderId) {
            setSelectedOption(null);
            setSelectedForwarder(null);
        }
    }, [selectedForwarderId]);

    useEffect(() => {
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
                    setSearchError(
                        error.message || 'Не удалось найти экспедиторов',
                    );
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
    }, [inputValue, selectedForwarder]);

    const options = useMemo(() => {
        if (
            selectedOption &&
            !forwarders.some((forwarder) => forwarder.id === selectedOption.id)
        ) {
            return [selectedOption, ...forwarders];
        }

        return forwarders;
    }, [forwarders, selectedOption]);

    return (
        <StepSection
            title='Выбор экспедитора'
            description='Найдите и выберите экспедитора, который будет закреплен за маршрутом'
        >
            <Controller
                name='forwarderId'
                control={control}
                render={({ field }) => (
                    <Stack spacing={2}>
                        <Autocomplete
                            multiple
                            value={selectedOption ? [selectedOption] : []}
                            inputValue={inputValue}
                            options={options}
                            loading={isLoading || isDetailsLoading}
                            filterOptions={(items) => items}
                            getOptionLabel={(option) => option?.fullName ?? ''}
                            isOptionEqualToValue={(option, value) =>
                                option?.id === value?.id
                            }
                            noOptionsText={
                                inputValue.trim().length < 2
                                    ? 'Введите минимум 2 символа'
                                    : 'Экспедитор не найден'
                            }
                            loadingText='Поиск экспедиторов...'
                            filterSelectedOptions
                            onInputChange={(_, newInputValue, reason) => {
                                if (reason === 'reset') {
                                    return;
                                }

                                setInputValue(newInputValue);
                            }}
                            onChange={async (_, newValue) => {
                                const lastSelectedForwarder =
                                    newValue.at(-1) ?? null;

                                if (!lastSelectedForwarder?.id) {
                                    setSelectedOption(null);
                                    setSelectedForwarder(null);
                                    field.onChange('');

                                    setValue('forwarder', null, {
                                        shouldDirty: true,
                                        shouldTouch: true,
                                        shouldValidate: false,
                                    });

                                    setInputValue('');
                                    return;
                                }

                                setSelectedOption(lastSelectedForwarder);
                                setSelectedForwarder(null);
                                field.onChange(lastSelectedForwarder.id);
                                setInputValue('');
                                setSearchError(null);

                                setValue('forwarder', null, {
                                    shouldDirty: true,
                                    shouldTouch: true,
                                    shouldValidate: false,
                                });

                                try {
                                    setIsDetailsLoading(true);

                                    const response = await fetchForwarderById(
                                        lastSelectedForwarder.id,
                                    );
                                    const details = response?.data || response;

                                    const detailedForwarder = {
                                        id:
                                            details.id ||
                                            lastSelectedForwarder.id,

                                        fullName:
                                            details.fio ||
                                            details.fullName ||
                                            lastSelectedForwarder.fullName ||
                                            '',

                                        iin:
                                            details.iin ||
                                            details.personIin ||
                                            lastSelectedForwarder.iin ||
                                            '',

                                        companyName:
                                            details.company_name ||
                                            details.companyName ||
                                            details.name ||
                                            lastSelectedForwarder.companyName ||
                                            '',

                                        companyBin:
                                            details.company_bin ||
                                            details.companyBin ||
                                            details.bin ||
                                            lastSelectedForwarder.companyBin ||
                                            '',

                                        phone:
                                            details.phone ||
                                            details.tel ||
                                            lastSelectedForwarder.phone ||
                                            '',

                                        companyAccount:
                                            details.company_account || '',
                                        companyBik: details.company_bik || '',
                                        companyAddress:
                                            details.company_address || '',
                                    };

                                    setSelectedOption(detailedForwarder);
                                    setSelectedForwarder(detailedForwarder);

                                    setValue('forwarder', detailedForwarder, {
                                        shouldDirty: true,
                                        shouldTouch: true,
                                        shouldValidate: false,
                                    });
                                } catch (error) {
                                    console.error(
                                        'Не удалось загрузить детали экспедитора:',
                                        error,
                                    );

                                    setSelectedOption(null);
                                    setSelectedForwarder(null);
                                    field.onChange('');

                                    setValue('forwarder', null, {
                                        shouldDirty: true,
                                        shouldTouch: true,
                                        shouldValidate: false,
                                    });

                                    setSearchError(
                                        'Не удалось загрузить данные экспедитора',
                                    );
                                } finally {
                                    setIsDetailsLoading(false);
                                }
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
                                    error={
                                        Boolean(errors.forwarderId) ||
                                        Boolean(searchError)
                                    }
                                    helperText={
                                        errors.forwarderId?.message ||
                                        searchError ||
                                        'Можно пропустить этот шаг и создать лид без экспедитора'
                                    }
                                />
                            )}
                        />

                        {isDetailsLoading && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    p: 1.5,
                                    borderRadius: 2,
                                    bgcolor: 'action.hover',
                                }}
                            >
                                <CircularProgress size={18} />
                                <Typography
                                    variant='body2'
                                    color='text.secondary'
                                >
                                    Загружаем данные экспедитора...
                                </Typography>
                            </Box>
                        )}

                        {selectedForwarder && !isDetailsLoading && (
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
                )}
            />
        </StepSection>
    );
}

ForwarderStep.propTypes = {
    setValue: PropTypes.func.isRequired,
    control: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired,
};

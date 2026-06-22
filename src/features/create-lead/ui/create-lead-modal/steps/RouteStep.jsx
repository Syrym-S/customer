import {
    Autocomplete,
    Box,
    Button,
    CircularProgress,
    TextField,
} from '@mui/material';
import PropTypes from 'prop-types';
import { Controller } from 'react-hook-form';

import { CustomerMapView } from '../../../../../widgets/customer-map/ui/CustomerMapView';
import { useCustomerMap } from '../../../../../widgets/customer-map/model/useCustomerMap';
import { useRouteMapPicker } from '../../../model/useRouteMapPicker';
import { StepSection } from '../components/StepSection';
import { searchGeocode } from '../../../api/geocoding.api';
import { useEffect, useState } from 'react';

export function RouteStep({ control, errors, form, setValue }) {
    const map = useCustomerMap();
    const [fromInputValue, setFromInputValue] = useState('');
    const [toInputValue, setToInputValue] = useState('');

    const [fromOptions, setFromOptions] = useState([]);
    const [toOptions, setToOptions] = useState([]);

    const [isFromSearchLoading, setIsFromSearchLoading] = useState(false);
    const [isToSearchLoading, setIsToSearchLoading] = useState(false);

    const {
        activeMapPoint,
        loadingPoints,
        routeMarkers,
        routePoints,
        isClearDisabled,
        setActiveMapPoint,
        handleRouteMapClick,
        handleRouteMarkerDragEnd,
        handleClearRoute,
        clearFromPoint,
        clearToPoint,
        setSelectedLocationPoint,
    } = useRouteMapPicker({
        form,
        setValue,
    });

    useEffect(() => {
        const query = fromInputValue.trim();

        if (query.length < 2 || query === form.fromLocation) {
            setFromOptions([]);
            return;
        }

        const controller = new AbortController();

        const timeoutId = setTimeout(async () => {
            try {
                setIsFromSearchLoading(true);

                const result = await searchGeocode(query, {
                    signal: controller.signal,
                });

                setFromOptions(result);
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error(error);
                    setFromOptions([]);
                }
            } finally {
                setIsFromSearchLoading(false);
            }
        }, 300);

        return () => {
            controller.abort();
            clearTimeout(timeoutId);
        };
    }, [fromInputValue, form.fromLocation]);

    useEffect(() => {
        const query = toInputValue.trim();

        if (query.length < 2 || query === form.toLocation) {
            setToOptions([]);
            return;
        }

        const controller = new AbortController();

        const timeoutId = setTimeout(async () => {
            try {
                setIsToSearchLoading(true);

                const result = await searchGeocode(query, {
                    signal: controller.signal,
                });

                setToOptions(result);
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error(error);
                    setToOptions([]);
                }
            } finally {
                setIsToSearchLoading(false);
            }
        }, 300);

        return () => {
            controller.abort();
            clearTimeout(timeoutId);
        };
    }, [toInputValue, form.toLocation]);

    return (
        <StepSection title='Маршрут'>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 1,
                    mb: 2,
                    flexWrap: 'wrap',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        gap: 1,
                        flexWrap: 'wrap',
                    }}
                >
                    <Button
                        size='small'
                        variant={
                            activeMapPoint === 'from' ? 'contained' : 'outlined'
                        }
                        onClick={() => setActiveMapPoint('from')}
                    >
                        Откуда
                    </Button>

                    <Button
                        size='small'
                        variant={
                            activeMapPoint === 'to' ? 'contained' : 'outlined'
                        }
                        onClick={() => setActiveMapPoint('to')}
                    >
                        Куда
                    </Button>
                </Box>

                <Button
                    size='small'
                    color='error'
                    variant='outlined'
                    onClick={handleClearRoute}
                    disabled={isClearDisabled}
                >
                    Очистить маршрут
                </Button>
            </Box>

            <Box
                sx={{
                    height: {
                        xs: 220,
                        sm: 280,
                    },
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    overflow: 'hidden',
                    mb: 2,
                }}
            >
                <CustomerMapView
                    center={map.center}
                    zoom={map.zoom}
                    markers={routeMarkers}
                    routePoints={routePoints}
                    handleMarkerClick={map.handleMarkerClick}
                    onMapClick={handleRouteMapClick}
                    onMarkerDragEnd={handleRouteMarkerDragEnd}
                />
            </Box>

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
                    name='fromLocation'
                    control={control}
                    rules={{
                        required: 'Укажите место отправления',
                        minLength: {
                            value: 3,
                            message: 'Минимум 3 символа',
                        },
                    }}
                    render={({ field }) => (
                        <Autocomplete
                            freeSolo
                            value={field.value || ''}
                            inputValue={fromInputValue || field.value || ''}
                            options={fromOptions}
                            loading={isFromSearchLoading || loadingPoints.from}
                            filterOptions={(items) => items}
                            getOptionLabel={(option) => {
                                if (typeof option === 'string') {
                                    return option;
                                }

                                return option?.label || option?.address || '';
                            }}
                            isOptionEqualToValue={(option, value) => {
                                if (typeof value === 'string') {
                                    return (
                                        option?.label === value ||
                                        option?.address === value
                                    );
                                }

                                return option?.address === value?.address;
                            }}
                            onInputChange={(_, newInputValue, reason) => {
                                if (reason === 'reset') {
                                    return;
                                }

                                setFromInputValue(newInputValue);
                                field.onChange(newInputValue);
                                clearFromPoint();
                            }}
                            onChange={(_, selectedOption) => {
                                if (
                                    !selectedOption ||
                                    typeof selectedOption === 'string'
                                ) {
                                    return;
                                }

                                setSelectedLocationPoint(
                                    'from',
                                    selectedOption,
                                );
                                setFromInputValue(
                                    selectedOption.label ||
                                        selectedOption.address ||
                                        '',
                                );
                                setFromOptions([]);
                            }}
                            noOptionsText={
                                fromInputValue.trim().length < 2
                                    ? 'Введите минимум 2 символа'
                                    : 'Адрес не найден'
                            }
                            loadingText='Поиск адреса...'
                            renderInput={(params) => {
                                const inputProps = params.InputProps || {};

                                return (
                                    <TextField
                                        {...params}
                                        label='Откуда'
                                        fullWidth
                                        size='small'
                                        error={Boolean(errors.fromLocation)}
                                        helperText={
                                            errors.fromLocation?.message
                                        }
                                        InputProps={{
                                            ...inputProps,
                                            endAdornment: (
                                                <>
                                                    {(isFromSearchLoading ||
                                                        loadingPoints.from) && (
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
                    )}
                />

                <Controller
                    name='toLocation'
                    control={control}
                    rules={{
                        required: 'Укажите место назначения',
                        minLength: {
                            value: 3,
                            message: 'Минимум 3 символа',
                        },
                    }}
                    render={({ field }) => (
                        <Autocomplete
                            freeSolo
                            value={field.value || ''}
                            inputValue={toInputValue || field.value || ''}
                            options={toOptions}
                            loading={isToSearchLoading || loadingPoints.to}
                            filterOptions={(items) => items}
                            getOptionLabel={(option) => {
                                if (typeof option === 'string') {
                                    return option;
                                }

                                return option?.label || option?.address || '';
                            }}
                            isOptionEqualToValue={(option, value) => {
                                if (typeof value === 'string') {
                                    return (
                                        option?.label === value ||
                                        option?.address === value
                                    );
                                }

                                return option?.address === value?.address;
                            }}
                            onInputChange={(_, newInputValue, reason) => {
                                if (reason === 'reset') {
                                    return;
                                }

                                setToInputValue(newInputValue);
                                field.onChange(newInputValue);
                                clearToPoint();
                            }}
                            onChange={(_, selectedOption) => {
                                if (
                                    !selectedOption ||
                                    typeof selectedOption === 'string'
                                ) {
                                    return;
                                }

                                setSelectedLocationPoint('to', selectedOption);
                                setToInputValue(
                                    selectedOption.label ||
                                        selectedOption.address ||
                                        '',
                                );
                                setToOptions([]);
                            }}
                            noOptionsText={
                                toInputValue.trim().length < 2
                                    ? 'Введите минимум 2 символа'
                                    : 'Адрес не найден'
                            }
                            loadingText='Поиск адреса...'
                            renderInput={(params) => {
                                const inputProps = params.InputProps || {};

                                return (
                                    <TextField
                                        {...params}
                                        label='Куда'
                                        fullWidth
                                        size='small'
                                        error={Boolean(errors.toLocation)}
                                        helperText={errors.toLocation?.message}
                                        InputProps={{
                                            ...inputProps,
                                            endAdornment: (
                                                <>
                                                    {(isToSearchLoading ||
                                                        loadingPoints.to) && (
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
                    )}
                />

                <Controller
                    name='loadingDate'
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label='Дата загрузки'
                            type='date'
                            fullWidth
                            size='small'
                            slotProps={{
                                inputLabel: {
                                    shrink: true,
                                },
                            }}
                            sx={{
                                gridColumn: {
                                    xs: 'auto',
                                    sm: '1 / -1',
                                },
                            }}
                        />
                    )}
                />
            </Box>
        </StepSection>
    );
}

RouteStep.propTypes = {
    control: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
    setValue: PropTypes.func.isRequired,
};

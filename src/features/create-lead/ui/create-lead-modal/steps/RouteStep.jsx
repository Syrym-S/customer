import {
    Autocomplete,
    Box,
    Button,
    CircularProgress,
    FormControl,
    FormHelperText,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    TextField,
} from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import PropTypes from 'prop-types';
import { Controller } from 'react-hook-form';

import { CustomerMapView } from '../../../../../widgets/customer-map/ui/CustomerMapView';
import { useCustomerMap } from '../../../../../widgets/customer-map/model/useCustomerMap';
import { useRouteMapPicker } from '../../../model/useRouteMapPicker';
import { StepSection } from '../components/StepSection';
import { searchGeocode } from '../../../api/geocoding.api';
import { useEffect, useState } from 'react';
import { buildRouteFitBoundsKey } from '../../../lib/route-map.helpers';
import {
    buildPointScheduleFields,
    getEndAtChangeDependentField,
    getEndAtMin,
    getStartAtChangeDependentField,
    getStartAtMin,
    hasWaypointCoordinates,
    validateEndAtOwnStart,
    validateStartAtChain,
} from '../../../lib/point-schedule.helpers';

export function RouteStep({ control, errors, form, setValue, trigger }) {
    const map = useCustomerMap();
    const [fromInputValue, setFromInputValue] = useState('');
    const [toInputValue, setToInputValue] = useState('');

    const [fromOptions, setFromOptions] = useState([]);
    const [toOptions, setToOptions] = useState([]);

    const [isFromSearchLoading, setIsFromSearchLoading] = useState(false);
    const [isToSearchLoading, setIsToSearchLoading] = useState(false);

    const waypoints = Array.isArray(form.waypoints) ? form.waypoints : [];
    const pointScheduleFields = buildPointScheduleFields(waypoints);

    function handleStartAtChange(fieldName, onChange) {
        return (event) => {
            onChange(event);

            const dependentField = getStartAtChangeDependentField(
                pointScheduleFields,
                fieldName,
            );

            if (dependentField) {
                trigger(dependentField);
            }
        };
    }

    function handleEndAtChange(fieldName, onChange) {
        return (event) => {
            onChange(event);

            const dependentField = getEndAtChangeDependentField(
                pointScheduleFields,
                fieldName,
            );

            if (dependentField) {
                trigger(dependentField);
            }
        };
    }

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
        clearWaypointPoint,
        handleAddWaypoint,
        handleRemoveWaypoint,
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

    const routeFitBoundsKey = buildRouteFitBoundsKey({
        routePoints,
        markers: routeMarkers,
    });

    const mapCenter = routePoints[0] || routeMarkers[0]?.position || map.center;
    const mapZoom = routePoints.length >= 2 ? 7 : map.zoom;

    return (
        <StepSection title="Маршрут">
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
                        size="small"
                        variant={
                            activeMapPoint === 'from' ? 'contained' : 'outlined'
                        }
                        onClick={() => setActiveMapPoint('from')}
                    >
                        Откуда
                    </Button>

                    {waypoints.map((_, index) => {
                        const pointKey = `waypoint-${index}`;

                        return (
                            <Button
                                key={pointKey}
                                size="small"
                                variant={
                                    activeMapPoint === pointKey
                                        ? 'contained'
                                        : 'outlined'
                                }
                                onClick={() => setActiveMapPoint(pointKey)}
                            >
                                Точка {index + 1}
                            </Button>
                        );
                    })}

                    <Button
                        size="small"
                        variant={
                            activeMapPoint === 'to' ? 'contained' : 'outlined'
                        }
                        onClick={() => setActiveMapPoint('to')}
                    >
                        Куда
                    </Button>

                    <Button
                        size="small"
                        variant="outlined"
                        onClick={handleAddWaypoint}
                    >
                        + Промежуточная
                    </Button>
                </Box>

                <Button
                    size="small"
                    color="error"
                    variant="outlined"
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
                    center={mapCenter}
                    zoom={mapZoom}
                    markers={routeMarkers}
                    routePoints={routePoints}
                    fitBoundsKey={routeFitBoundsKey}
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
                    name="fromLocation"
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
                            loadingText="Поиск адреса..."
                            renderInput={(params) => {
                                const inputProps = params.InputProps || {};

                                return (
                                    <TextField
                                        {...params}
                                        label="Откуда"
                                        fullWidth
                                        size="small"
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
                    )}
                />

                <Box
                    sx={{
                        display: 'flex',
                        gap: 1,
                        flexWrap: 'wrap',
                        gridColumn: {
                            xs: 'auto',
                            sm: '1 / -1',
                        },
                    }}
                >
                    <Controller
                        name="fromStartAt"
                        control={control}
                        rules={{
                            required: 'Укажите дату начала в точке отправления',
                            validate: validateStartAtChain(
                                form,
                                pointScheduleFields,
                                'fromStartAt',
                            ),
                        }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                onChange={handleStartAtChange(
                                    'fromStartAt',
                                    field.onChange,
                                )}
                                label="Начало (Откуда)"
                                type="date"
                                size="small"
                                error={Boolean(errors.fromStartAt)}
                                helperText={errors.fromStartAt?.message}
                                sx={{ flex: 1, minWidth: 160 }}
                                slotProps={{
                                    inputLabel: { shrink: true },
                                }}
                            />
                        )}
                    />

                    <Controller
                        name="fromEndAt"
                        control={control}
                        rules={{
                            required: 'Укажите дату окончания в точке отправления',
                            validate: validateEndAtOwnStart(
                                form,
                                pointScheduleFields,
                                'fromEndAt',
                            ),
                        }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                onChange={handleEndAtChange(
                                    'fromEndAt',
                                    field.onChange,
                                )}
                                label="Окончание (Откуда)"
                                type="date"
                                size="small"
                                error={Boolean(errors.fromEndAt)}
                                helperText={errors.fromEndAt?.message}
                                sx={{ flex: 1, minWidth: 160 }}
                                slotProps={{
                                    inputLabel: { shrink: true },
                                    htmlInput: (() => {
                                        const min = getEndAtMin(
                                            form,
                                            pointScheduleFields,
                                            'fromEndAt',
                                        );

                                        return min ? { min } : undefined;
                                    })(),
                                }}
                            />
                        )}
                    />
                </Box>

                {waypoints.map((waypoint, index) => {
                    const pointKey = `waypoint-${index}`;
                    const waypointTypeError =
                        errors.waypoints?.[index]?.type;
                    const waypointLocationFieldName = `waypoints.${index}.location`;
                    const waypointLocationError =
                        errors.waypoints?.[index]?.location;
                    const waypointStartAtFieldName = `waypoints.${index}.startAt`;
                    const waypointEndAtFieldName = `waypoints.${index}.endAt`;
                    const waypointStartAtError =
                        errors.waypoints?.[index]?.startAt;
                    const waypointEndAtError =
                        errors.waypoints?.[index]?.endAt;
                    const waypointStartAtMin = getStartAtMin(
                        form,
                        pointScheduleFields,
                        waypointStartAtFieldName,
                    );
                    const waypointEndAtMin = getEndAtMin(
                        form,
                        pointScheduleFields,
                        waypointEndAtFieldName,
                    );

                    return (
                        <Box
                            key={waypoint.id || pointKey}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                                gridColumn: {
                                    xs: 'auto',
                                    sm: '1 / -1',
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    gap: 1,
                                    alignItems: 'flex-start',
                                }}
                            >
                                <Controller
                                    name={waypointLocationFieldName}
                                    control={control}
                                    rules={{
                                        required:
                                            'Выберите эту точку и кликните по карте',
                                        validate: () =>
                                            hasWaypointCoordinates(
                                                waypoint,
                                            ) ||
                                            `Укажите координаты для точки ${index + 1}: кликните по карте`,
                                    }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label={`Промежуточная точка #${index + 1}`}
                                            value={waypoint.location || ''}
                                            onFocus={() =>
                                                setActiveMapPoint(pointKey)
                                            }
                                            onChange={(event) => {
                                                field.onChange(event);

                                                if (
                                                    waypoint.lat ||
                                                    waypoint.lng
                                                ) {
                                                    clearWaypointPoint(index);
                                                }
                                            }}
                                            fullWidth
                                            size="small"
                                            error={Boolean(
                                                waypointLocationError,
                                            )}
                                            helperText={
                                                waypointLocationError?.message ||
                                                (loadingPoints[pointKey]
                                                    ? 'Определяем адрес...'
                                                    : 'Выберите эту точку и кликните по карте')
                                            }
                                            InputProps={{
                                                endAdornment: loadingPoints[
                                                    pointKey
                                                ] ? (
                                                    <CircularProgress
                                                        color="inherit"
                                                        size={18}
                                                    />
                                                ) : null,
                                            }}
                                        />
                                    )}
                                />

                                <Button
                                    size="small"
                                    variant={
                                        activeMapPoint === pointKey
                                            ? 'contained'
                                            : 'outlined'
                                    }
                                    onClick={() => setActiveMapPoint(pointKey)}
                                    sx={{
                                        whiteSpace: 'nowrap',
                                        minHeight: 40,
                                    }}
                                >
                                    На карте
                                </Button>

                                <IconButton
                                    color="error"
                                    size="small"
                                    onClick={() => handleRemoveWaypoint(index)}
                                    sx={{
                                        mt: 0.25,
                                        flexShrink: 0,
                                    }}
                                    aria-label={`Удалить промежуточную точку ${index + 1}`}
                                    title={`Удалить промежуточную точку ${index + 1}`}
                                >
                                    <DeleteOutlineRoundedIcon fontSize="small" />
                                </IconButton>
                            </Box>

                            <Box
                                sx={{
                                    display: 'flex',
                                    gap: 1,
                                    flexWrap: 'wrap',
                                }}
                            >
                                <Controller
                                    name={`waypoints.${index}.type`}
                                    control={control}
                                    render={({ field }) => (
                                        <FormControl
                                            size="small"
                                            fullWidth
                                            error={Boolean(waypointTypeError)}
                                            sx={{
                                                flex: 1,
                                                minWidth: 160,
                                            }}
                                        >
                                            <InputLabel
                                                id={`${pointKey}-type-label`}
                                            >
                                                Тип точки
                                            </InputLabel>
                                            <Select
                                                {...field}
                                                labelId={`${pointKey}-type-label`}
                                                label="Тип точки"
                                                value={
                                                    field.value ||
                                                    'check_passes'
                                                }
                                            >
                                                <MenuItem value="loading">
                                                    Погрузка
                                                </MenuItem>
                                                <MenuItem value="unloading">
                                                    Разгрузка
                                                </MenuItem>
                                                <MenuItem value="check_passes">
                                                    Транзит
                                                </MenuItem>
                                            </Select>
                                            <FormHelperText>
                                                {waypointTypeError?.message}
                                            </FormHelperText>
                                        </FormControl>
                                    )}
                                />

                                <Controller
                                    name={waypointStartAtFieldName}
                                    control={control}
                                    rules={{
                                        required: `Укажите дату начала для точки ${index + 1}`,
                                        validate: validateStartAtChain(
                                            form,
                                            pointScheduleFields,
                                            waypointStartAtFieldName,
                                        ),
                                    }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            onChange={handleStartAtChange(
                                                waypointStartAtFieldName,
                                                field.onChange,
                                            )}
                                            label={`Начало (точка ${index + 1})`}
                                            type="date"
                                            size="small"
                                            error={Boolean(
                                                waypointStartAtError,
                                            )}
                                            helperText={
                                                waypointStartAtError?.message
                                            }
                                            sx={{
                                                flex: 1,
                                                minWidth: 160,
                                            }}
                                            slotProps={{
                                                inputLabel: {
                                                    shrink: true,
                                                },
                                                htmlInput: waypointStartAtMin
                                                    ? { min: waypointStartAtMin }
                                                    : undefined,
                                            }}
                                        />
                                    )}
                                />

                                <Controller
                                    name={waypointEndAtFieldName}
                                    control={control}
                                    rules={{
                                        required: `Укажите дату окончания для точки ${index + 1}`,
                                        validate: validateEndAtOwnStart(
                                            form,
                                            pointScheduleFields,
                                            waypointEndAtFieldName,
                                        ),
                                    }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            onChange={handleEndAtChange(
                                                waypointEndAtFieldName,
                                                field.onChange,
                                            )}
                                            label={`Окончание (точка ${index + 1})`}
                                            type="date"
                                            size="small"
                                            error={Boolean(
                                                waypointEndAtError,
                                            )}
                                            helperText={
                                                waypointEndAtError?.message
                                            }
                                            sx={{
                                                flex: 1,
                                                minWidth: 160,
                                            }}
                                            slotProps={{
                                                inputLabel: {
                                                    shrink: true,
                                                },
                                                htmlInput: waypointEndAtMin
                                                    ? { min: waypointEndAtMin }
                                                    : undefined,
                                            }}
                                        />
                                    )}
                                />
                            </Box>
                        </Box>
                    );
                })}

                <Controller
                    name="toLocation"
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
                            loadingText="Поиск адреса..."
                            renderInput={(params) => {
                                const inputProps = params.InputProps || {};

                                return (
                                    <TextField
                                        {...params}
                                        label="Куда"
                                        fullWidth
                                        size="small"
                                        error={Boolean(errors.toLocation)}
                                        helperText={errors.toLocation?.message}
                                        InputProps={{
                                            ...inputProps,
                                            endAdornment: (
                                                <>
                                                    {(isToSearchLoading ||
                                                        loadingPoints.to) && (
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
                    )}
                />

                <Box
                    sx={{
                        display: 'flex',
                        gap: 1,
                        flexWrap: 'wrap',
                        gridColumn: {
                            xs: 'auto',
                            sm: '1 / -1',
                        },
                    }}
                >
                    <Controller
                        name="toStartAt"
                        control={control}
                        rules={{
                            required: 'Укажите дату начала в точке назначения',
                            validate: validateStartAtChain(
                                form,
                                pointScheduleFields,
                                'toStartAt',
                            ),
                        }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                onChange={handleStartAtChange(
                                    'toStartAt',
                                    field.onChange,
                                )}
                                label="Начало (Куда)"
                                type="date"
                                size="small"
                                error={Boolean(errors.toStartAt)}
                                helperText={errors.toStartAt?.message}
                                sx={{ flex: 1, minWidth: 160 }}
                                slotProps={{
                                    inputLabel: { shrink: true },
                                    htmlInput: (() => {
                                        const min = getStartAtMin(
                                            form,
                                            pointScheduleFields,
                                            'toStartAt',
                                        );

                                        return min ? { min } : undefined;
                                    })(),
                                }}
                            />
                        )}
                    />

                    <Controller
                        name="toEndAt"
                        control={control}
                        rules={{
                            required: 'Укажите дату окончания в точке назначения',
                            validate: validateEndAtOwnStart(
                                form,
                                pointScheduleFields,
                                'toEndAt',
                            ),
                        }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                onChange={handleEndAtChange(
                                    'toEndAt',
                                    field.onChange,
                                )}
                                label="Окончание (Куда)"
                                type="date"
                                size="small"
                                error={Boolean(errors.toEndAt)}
                                helperText={errors.toEndAt?.message}
                                sx={{ flex: 1, minWidth: 160 }}
                                slotProps={{
                                    inputLabel: { shrink: true },
                                    htmlInput: (() => {
                                        const min = getEndAtMin(
                                            form,
                                            pointScheduleFields,
                                            'toEndAt',
                                        );

                                        return min ? { min } : undefined;
                                    })(),
                                }}
                            />
                        )}
                    />
                </Box>
            </Box>
        </StepSection>
    );
}

RouteStep.propTypes = {
    control: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
    setValue: PropTypes.func.isRequired,
    trigger: PropTypes.func.isRequired,
};

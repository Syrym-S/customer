import {
    Autocomplete,
    Box,
    CircularProgress,
    IconButton,
    TextField,
} from '@mui/material';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { searchGeocode } from '../../../api/geocoding.api';
import {
    getRouteHistoryEntryKey,
    readRouteHistoryPoint,
    removeRouteHistoryEntry,
} from '../../../model/route-history.storage';

const MIN_SEARCH_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 300;

function getOptionLabel(option) {
    if (typeof option === 'string') {
        return option;
    }

    return option?.label || option?.address || '';
}

export function RoutePointAutocomplete({
    point,
    name,
    control,
    rules,
    label,
    error,
    helperText,
    isPointLoading,
    onSelectLocation,
    onClearPoint,
}) {
    const { t } = useTranslation();

    const [inputValue, setInputValue] = useState('');
    const [searchOptions, setSearchOptions] = useState([]);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [history, setHistory] = useState([]);

    const lastSelectedLabelRef = useRef('');

    const query = inputValue.trim();
    const isHistoryVisible = query.length < MIN_SEARCH_LENGTH;
    const options = isHistoryVisible ? history : searchOptions;
    const isLoading = isSearchLoading || isPointLoading;

    useEffect(() => {
        setHistory(readRouteHistoryPoint(point));
    }, [point]);

    useEffect(() => {
        if (
            query.length < MIN_SEARCH_LENGTH ||
            query === lastSelectedLabelRef.current
        ) {
            setSearchOptions([]);
            return;
        }

        const controller = new AbortController();

        const timeoutId = setTimeout(async () => {
            try {
                setIsSearchLoading(true);

                const result = await searchGeocode(query, {
                    signal: controller.signal,
                });

                setSearchOptions(result);
            } catch (searchError) {
                if (searchError.name !== 'AbortError') {
                    console.error(searchError);
                    setSearchOptions([]);
                }
            } finally {
                setIsSearchLoading(false);
            }
        }, SEARCH_DEBOUNCE_MS);

        return () => {
            controller.abort();
            clearTimeout(timeoutId);
        };
    }, [query]);

    function handleRemoveHistoryEntry(entry) {
        setHistory(removeRouteHistoryEntry(point, entry));
    }

    function getNoOptionsText() {
        if (isHistoryVisible) {
            return t('common.search.minChars');
        }

        return t('route.addressNotFound');
    }

    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field }) => (
                <Autocomplete
                    freeSolo
                    openOnFocus
                    value={field.value || ''}
                    inputValue={inputValue || field.value || ''}
                    options={options}
                    loading={isLoading}
                    filterOptions={(items) => items}
                    getOptionLabel={getOptionLabel}
                    groupBy={
                        isHistoryVisible
                            ? () => t('route.history.recent')
                            : undefined
                    }
                    isOptionEqualToValue={(option, value) => {
                        if (typeof value === 'string') {
                            return (
                                option?.label === value ||
                                option?.address === value
                            );
                        }

                        return option?.address === value?.address;
                    }}
                    onOpen={() => setHistory(readRouteHistoryPoint(point))}
                    onInputChange={(_, newInputValue, reason) => {
                        if (reason === 'reset') {
                            return;
                        }

                        setInputValue(newInputValue);
                        field.onChange(newInputValue);
                        onClearPoint();
                    }}
                    onChange={(_, selectedOption) => {
                        if (
                            !selectedOption ||
                            typeof selectedOption === 'string'
                        ) {
                            return;
                        }

                        onSelectLocation(selectedOption);

                        const selectedLabel = getOptionLabel(selectedOption);

                        lastSelectedLabelRef.current = selectedLabel.trim();
                        setInputValue(selectedLabel);
                        setSearchOptions([]);
                    }}
                    noOptionsText={getNoOptionsText()}
                    loadingText={t('route.addressSearching')}
                    renderOption={(optionProps, option) => {
                        const { key, ...restOptionProps } = optionProps;
                        const optionLabel = getOptionLabel(option);

                        if (!isHistoryVisible) {
                            return (
                                <Box
                                    component="li"
                                    key={key}
                                    {...restOptionProps}
                                >
                                    {optionLabel}
                                </Box>
                            );
                        }

                        return (
                            <Box
                                component="li"
                                key={getRouteHistoryEntryKey(option) || key}
                                {...restOptionProps}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                }}
                            >
                                <HistoryRoundedIcon
                                    fontSize="small"
                                    color="disabled"
                                />

                                <Box
                                    sx={{
                                        flex: 1,
                                        minWidth: 0,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}
                                >
                                    {optionLabel}
                                </Box>

                                <IconButton
                                    size="small"
                                    aria-label={t('route.history.remove')}
                                    title={t('route.history.remove')}
                                    onMouseDown={(event) =>
                                        event.preventDefault()
                                    }
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        handleRemoveHistoryEntry(option);
                                    }}
                                >
                                    <ClearRoundedIcon fontSize="inherit" />
                                </IconButton>
                            </Box>
                        );
                    }}
                    renderInput={(params) => {
                        const inputProps = params.InputProps || {};

                        return (
                            <TextField
                                {...params}
                                label={label}
                                fullWidth
                                size="small"
                                error={error}
                                helperText={helperText}
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
            )}
        />
    );
}

RoutePointAutocomplete.propTypes = {
    point: PropTypes.oneOf(['from', 'to']).isRequired,
    name: PropTypes.string.isRequired,
    control: PropTypes.object.isRequired,
    rules: PropTypes.object,
    label: PropTypes.string.isRequired,
    error: PropTypes.bool,
    helperText: PropTypes.string,
    isPointLoading: PropTypes.bool,
    onSelectLocation: PropTypes.func.isRequired,
    onClearPoint: PropTypes.func.isRequired,
};

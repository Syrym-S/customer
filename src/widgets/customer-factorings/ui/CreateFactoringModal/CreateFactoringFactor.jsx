import { useEffect, useMemo, useState } from 'react';
import {
    Autocomplete,
    Box,
    Chip,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import {
    getFactorBin,
    getFactorCompanyName,
    getFactorContact,
    getFactorId,
    getFactorOptionLabel,
    normalizeListResponse,
} from '../../model/create-factoring.helpers';
import { searchFactorsApi } from '../../api/factorings.api';

export function CreateFactoringFactor({
    selectedFactor,
    onChange,
    error,
    disabled,
}) {
    const [factorInputValue, setFactorInputValue] = useState('');
    const [factors, setFactors] = useState([]);
    const [isFactorsLoading, setIsFactorsLoading] = useState(false);
    const [factorsSearchError, setFactorsSearchError] = useState('');

    const factorOptions = useMemo(() => {
        if (
            selectedFactor &&
            !factors.some(
                (factor) => getFactorId(factor) === getFactorId(selectedFactor),
            )
        ) {
            return [selectedFactor, ...factors];
        }

        return factors;
    }, [factors, selectedFactor]);

    function handleFactorChange(_, newValue, reason) {
        if (reason === 'clear' || !newValue) {
            onChange(null);
            setFactorInputValue('');
            return;
        }

        onChange(newValue);
        setFactorInputValue(getFactorOptionLabel(newValue));
    }

    useEffect(() => {
        if (!selectedFactor) {
            return;
        }

        setFactorInputValue(getFactorOptionLabel(selectedFactor));
    }, [selectedFactor]);

    useEffect(() => {
        const query = factorInputValue.trim();

        if (selectedFactor && query === getFactorOptionLabel(selectedFactor)) {
            setFactors([]);
            setFactorsSearchError('');
            return;
        }

        if (query.length < 2) {
            setFactors([]);
            setFactorsSearchError('');
            return;
        }

        let isCancelled = false;

        const timeoutId = setTimeout(async () => {
            try {
                setIsFactorsLoading(true);
                setFactorsSearchError('');

                const response = await searchFactorsApi({
                    q: query,
                    page: 1,
                    perPage: 10,
                });

                const nextFactors = normalizeListResponse(response);

                if (!isCancelled) {
                    setFactors(nextFactors);
                }
            } catch (searchError) {
                if (!isCancelled) {
                    setFactors([]);
                    setFactorsSearchError(
                        searchError.response?.data?.message ||
                            searchError.response?.data?.error ||
                            searchError.message ||
                            'Не удалось найти факторы',
                    );
                }
            } finally {
                if (!isCancelled) {
                    setIsFactorsLoading(false);
                }
            }
        }, 300);

        return () => {
            isCancelled = true;
            clearTimeout(timeoutId);
        };
    }, [factorInputValue, selectedFactor]);

    return (
        <>
            <Autocomplete
                fullWidth
                value={selectedFactor}
                inputValue={factorInputValue}
                options={factorOptions}
                loading={isFactorsLoading}
                filterOptions={(items) => items}
                getOptionLabel={getFactorOptionLabel}
                isOptionEqualToValue={(option, value) =>
                    getFactorId(option) === getFactorId(value)
                }
                noOptionsText={
                    factorInputValue.trim().length < 2
                        ? 'Введите минимум 2 символа'
                        : 'Факторы не найдены'
                }
                loadingText='Поиск факторов...'
                onInputChange={(_, newInputValue, reason) => {
                    if (reason === 'reset') {
                        setFactorInputValue(newInputValue);
                        return;
                    }

                    if (reason === 'clear') {
                        onChange(null);
                        setFactorInputValue('');
                        return;
                    }

                    setFactorInputValue(newInputValue);

                    if (
                        selectedFactor &&
                        newInputValue !== getFactorOptionLabel(selectedFactor)
                    ) {
                        onChange(null);
                    }
                }}
                onChange={handleFactorChange}
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
                                    {getFactorCompanyName(option)}
                                </Typography>

                                <Typography
                                    color='text.secondary'
                                    sx={{ fontSize: 12 }}
                                >
                                    БИН/ИИН: {getFactorBin(option)}
                                </Typography>

                                {getFactorContact(option) && (
                                    <Typography
                                        color='text.secondary'
                                        sx={{ fontSize: 12 }}
                                    >
                                        {getFactorContact(option)}
                                    </Typography>
                                )}
                            </Box>

                            <Chip
                                size='small'
                                label='Фактор'
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
                        fullWidth
                        label='Фактор'
                        placeholder='Введите БИН, ИИН или название компании'
                        error={Boolean(error || factorsSearchError)}
                        helperText={
                            error ||
                            factorsSearchError ||
                            'Выберите фактор, который будет участвовать в сделке'
                        }
                        disabled={disabled}
                    />
                )}
            />

            {selectedFactor && (
                <Box
                    sx={{
                        p: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        backgroundColor: 'grey.50',
                    }}
                >
                    <Stack spacing={1.25}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                gap: 1,
                                flexWrap: 'wrap',
                            }}
                        >
                            <Box sx={{ minWidth: 0 }}>
                                <Typography fontWeight={700}>
                                    {getFactorCompanyName(selectedFactor)}
                                </Typography>

                                <Typography
                                    color='text.secondary'
                                    sx={{ fontSize: 13, mt: 0.3 }}
                                >
                                    БИН/ИИН: {getFactorBin(selectedFactor)}
                                </Typography>

                                {getFactorContact(selectedFactor) && (
                                    <Typography
                                        color='text.secondary'
                                        sx={{ fontSize: 13, mt: 0.3 }}
                                    >
                                        Контакт:{' '}
                                        {getFactorContact(selectedFactor)}
                                    </Typography>
                                )}
                            </Box>

                            <Chip
                                size='small'
                                label='Выбранный фактор'
                                color='primary'
                                variant='outlined'
                                sx={{
                                    borderRadius: 999,
                                }}
                            />
                        </Box>

                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: {
                                    xs: '1fr',
                                    sm: 'repeat(2, 1fr)',
                                },
                                gap: 1,
                            }}
                        >
                            <Box
                                sx={{
                                    p: 1.25,
                                    borderRadius: 2,
                                    backgroundColor: 'background.paper',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                }}
                            >
                                <Typography
                                    color='text.secondary'
                                    sx={{ fontSize: 12, mb: 0.3 }}
                                >
                                    Factor ID
                                </Typography>

                                <Typography
                                    sx={{
                                        fontSize: 14,
                                        wordBreak: 'break-word',
                                    }}
                                >
                                    {getFactorId(selectedFactor)}
                                </Typography>
                            </Box>

                            <Box
                                sx={{
                                    p: 1.25,
                                    borderRadius: 2,
                                    backgroundColor: 'background.paper',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                }}
                            >
                                <Typography
                                    color='text.secondary'
                                    sx={{ fontSize: 12, mb: 0.3 }}
                                >
                                    Телефон
                                </Typography>

                                <Typography sx={{ fontSize: 14 }}>
                                    {selectedFactor.phone || 'Не указан'}
                                </Typography>
                            </Box>
                        </Box>
                    </Stack>
                </Box>
            )}
        </>
    );
}

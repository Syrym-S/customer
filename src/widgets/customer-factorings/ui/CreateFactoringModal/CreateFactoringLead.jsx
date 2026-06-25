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
    getCargoLabel,
    getLeadCurrency,
    getLeadForwarderLabel,
    getLeadId,
    getLeadOptionLabel,
    getLeadPrice,
    isFinishedLead,
    normalizeListResponse,
} from '../../model/create-factoring.helpers';
import { searchFinishedCustomerLeadsApi } from '../../api/factorings.api';
import { formatMoney } from '../../model/factorings.helpers';

export function CreateFactoringLead({
    selectedLead,
    onChange,
    error,
    disabled,
}) {
    const [leadInputValue, setLeadInputValue] = useState('');
    const [leads, setLeads] = useState([]);
    const [isLeadsLoading, setIsLeadsLoading] = useState(false);
    const [leadsSearchError, setLeadsSearchError] = useState('');

    const leadOptions = useMemo(() => {
        if (
            selectedLead &&
            !leads.some((lead) => getLeadId(lead) === getLeadId(selectedLead))
        ) {
            return [selectedLead, ...leads];
        }

        return leads;
    }, [leads, selectedLead]);

    function handleLeadChange(_, newValue, reason) {
        if (reason === 'clear' || !newValue) {
            onChange(null);
            setLeadInputValue('');
            return;
        }

        onChange(newValue);
        setLeadInputValue(getLeadOptionLabel(newValue));
    }

    useEffect(() => {
        if (!selectedLead) {
            return;
        }

        setLeadInputValue(getLeadOptionLabel(selectedLead));
    }, [selectedLead]);

    useEffect(() => {
        const query = leadInputValue.trim();

        if (selectedLead && query === getLeadOptionLabel(selectedLead)) {
            setLeads([]);
            setLeadsSearchError('');
            return;
        }

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

                const response = await searchFinishedCustomerLeadsApi({
                    q: query,
                    page: 1,
                    perPage: 10,
                });

                const finishedLeads =
                    normalizeListResponse(response).filter(isFinishedLead);

                if (!isCancelled) {
                    setLeads(finishedLeads);
                }
            } catch (searchError) {
                if (!isCancelled) {
                    setLeads([]);
                    setLeadsSearchError(
                        searchError.response?.data?.message ||
                            searchError.response?.data?.error ||
                            searchError.message ||
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
    }, [leadInputValue, selectedLead]);

    return (
        <>
            <Autocomplete
                fullWidth
                value={selectedLead}
                inputValue={leadInputValue}
                options={leadOptions}
                loading={isLeadsLoading}
                filterOptions={(items) => items}
                getOptionLabel={getLeadOptionLabel}
                isOptionEqualToValue={(option, value) =>
                    getLeadId(option) === getLeadId(value)
                }
                noOptionsText={
                    leadInputValue.trim().length < 2
                        ? 'Введите минимум 2 символа'
                        : 'Завершённые лиды не найдены'
                }
                loadingText='Поиск лидов...'
                onInputChange={(_, newInputValue, reason) => {
                    if (reason === 'reset') {
                        setLeadInputValue(newInputValue);
                        return;
                    }

                    if (reason === 'clear') {
                        onChange(null);
                        setLeadInputValue('');
                        return;
                    }

                    setLeadInputValue(newInputValue);

                    if (
                        selectedLead &&
                        newInputValue !== getLeadOptionLabel(selectedLead)
                    ) {
                        onChange(null);
                    }
                }}
                onChange={handleLeadChange}
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
                                {option.title ||
                                    option.label ||
                                    `Лид #${getLeadId(option)}`}
                            </Typography>

                            <Typography
                                color='text.secondary'
                                sx={{ fontSize: 13 }}
                            >
                                Груз: {getCargoLabel(option)}
                            </Typography>

                            {getLeadForwarderLabel(option) && (
                                <Typography
                                    color='text.secondary'
                                    sx={{ fontSize: 13 }}
                                >
                                    Экспедитор: {getLeadForwarderLabel(option)}
                                </Typography>
                            )}

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
                                    label={formatMoney(
                                        getLeadPrice(option),
                                        getLeadCurrency(option),
                                    )}
                                    sx={{ height: 22 }}
                                />
                            </Box>
                        </Box>
                    );
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        fullWidth
                        label='Лид'
                        placeholder='Введите город, груз или направление'
                        error={Boolean(error || leadsSearchError)}
                        helperText={
                            error ||
                            leadsSearchError ||
                            'Выберите завершённый лид для факторинга'
                        }
                        disabled={disabled}
                    />
                )}
            />

            {selectedLead && (
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
                                    {selectedLead.title ||
                                        selectedLead.label ||
                                        `Лид #${getLeadId(selectedLead)}`}
                                </Typography>

                                <Typography
                                    color='text.secondary'
                                    sx={{ fontSize: 13, mt: 0.3 }}
                                >
                                    Груз: {getCargoLabel(selectedLead)}
                                </Typography>

                                {getLeadForwarderLabel(selectedLead) && (
                                    <Typography
                                        color='text.secondary'
                                        sx={{ fontSize: 13, mt: 0.3 }}
                                    >
                                        Экспедитор:{' '}
                                        {getLeadForwarderLabel(selectedLead)}
                                    </Typography>
                                )}
                            </Box>

                            {selectedLead.status && (
                                <Chip
                                    size='small'
                                    label={selectedLead.status}
                                    variant='outlined'
                                    sx={{
                                        borderRadius: 999,
                                    }}
                                />
                            )}
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
                                    backgroundColor: 'rgba(33, 150, 243, 0.08)',
                                    border: '1px solid',
                                    borderColor: 'primary.light',
                                }}
                            >
                                <Typography
                                    color='text.secondary'
                                    sx={{ fontSize: 12, mb: 0.3 }}
                                >
                                    Цена лида
                                </Typography>

                                <Typography
                                    sx={{
                                        fontSize: 14,
                                        fontWeight: 600,
                                        color: 'primary.main',
                                    }}
                                >
                                    {formatMoney(
                                        getLeadPrice(selectedLead),
                                        getLeadCurrency(selectedLead),
                                    )}
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
                                    Lead ID
                                </Typography>

                                <Typography
                                    sx={{
                                        fontSize: 14,
                                        wordBreak: 'break-word',
                                    }}
                                >
                                    {getLeadId(selectedLead)}
                                </Typography>
                            </Box>
                        </Box>
                    </Stack>
                </Box>
            )}
        </>
    );
}

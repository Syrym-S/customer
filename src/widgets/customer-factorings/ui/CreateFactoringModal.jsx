import { useEffect, useMemo, useState } from 'react';

import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    MenuItem,
    TextField,
    Typography,
} from '@mui/material';
import {
    getLeadOptionLabel,
    initialCreateFactoringForm,
    mapCreateFactoringFormToApi,
    validateCreateFactoringForm,
} from '../model/create-factoring.helpers';
import {
    formatMoney,
    isFinishedLead,
    normalizeLeadsResponse,
} from '../model/factorings.helpers';
import { searchFinishedCustomerLeadsApi } from '../api/factorings.api';

const currencies = ['KZT', 'USD', 'EUR', 'RUB'];

export function CreateFactoringModal({
    open,
    loading,
    error,
    onClose,
    onSubmit,
}) {
    const [form, setForm] = useState(initialCreateFactoringForm);
    const [errors, setErrors] = useState({});

    const [leadInputValue, setLeadInputValue] = useState('');
    const [selectedLead, setSelectedLead] = useState(null);
    const [leads, setLeads] = useState([]);
    const [isLeadsLoading, setIsLeadsLoading] = useState(false);
    const [leadsSearchError, setLeadsSearchError] = useState('');

    const leadOptions = useMemo(() => {
        if (
            selectedLead &&
            !leads.some((lead) => lead.id === selectedLead.id)
        ) {
            return [selectedLead, ...leads];
        }

        return leads;
    }, [leads, selectedLead]);

    function handleFieldChange(event) {
        const { name, value } = event.target;

        setForm((prevForm) => ({
            ...prevForm,
            [name]: value,
        }));

        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: '',
        }));
    }

    function handleLeadChange(_, newValue, reason) {
        if (reason === 'clear' || !newValue) {
            setSelectedLead(null);
            setLeadInputValue('');
            return;
        }

        setSelectedLead(newValue);
        setLeadInputValue(getLeadOptionLabel(newValue));

        setErrors((prevErrors) => ({
            ...prevErrors,
            lead: '',
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const nextErrors = validateCreateFactoringForm(form, selectedLead);

        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            return;
        }

        const payload = mapCreateFactoringFormToApi(form, selectedLead);

        await onSubmit(payload);
    }

    useEffect(() => {
        if (!open) {
            setForm(initialCreateFactoringForm);
            setErrors({});
            setSelectedLead(null);
            setLeadInputValue('');
            setLeads([]);
            setLeadsSearchError('');
        }
    }, [open]);

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
                    normalizeLeadsResponse(response).filter(isFinishedLead);

                if (!isCancelled) {
                    setLeads(finishedLeads);
                }
            } catch (searchError) {
                if (!isCancelled) {
                    setLeads([]);
                    setLeadsSearchError(
                        searchError.response?.data?.message ||
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
        <Dialog
            open={open}
            onClose={loading ? undefined : onClose}
            maxWidth='sm'
            fullWidth
        >
            <DialogTitle>Создать факторинг</DialogTitle>

            <DialogContent>
                <Grid
                    component='form'
                    container
                    spacing={2}
                    onSubmit={handleSubmit}
                    sx={{ pt: 1 }}
                >
                    {error && (
                        <Grid item xs={12}>
                            <Alert severity='error'>{error}</Alert>
                        </Grid>
                    )}

                    <Grid item xs={12}>
                        <Autocomplete
                            value={selectedLead}
                            inputValue={leadInputValue}
                            options={leadOptions}
                            loading={isLeadsLoading}
                            filterOptions={(items) => items}
                            getOptionLabel={getLeadOptionLabel}
                            isOptionEqualToValue={(option, value) =>
                                option?.id === value?.id
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
                                    setSelectedLead(null);
                                    setLeadInputValue('');
                                    return;
                                }

                                setLeadInputValue(newInputValue);

                                if (
                                    selectedLead &&
                                    newInputValue !==
                                        getLeadOptionLabel(selectedLead)
                                ) {
                                    setSelectedLead(null);
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
                                                `Лид #${option.id}`}
                                        </Typography>

                                        <Typography
                                            color='text.secondary'
                                            sx={{ fontSize: 13 }}
                                        >
                                            Груз:{' '}
                                            {option.cargo ||
                                                option.cargo_name ||
                                                'Не указан'}
                                        </Typography>

                                        {option.forwarder && (
                                            <Typography
                                                color='text.secondary'
                                                sx={{ fontSize: 13 }}
                                            >
                                                Экспедитор: {option.forwarder}
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
                                                    option.price,
                                                    option.currency,
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
                                    label='Лид'
                                    placeholder='Введите город, груз или направление'
                                    error={Boolean(
                                        errors.lead || leadsSearchError,
                                    )}
                                    helperText={
                                        errors.lead ||
                                        leadsSearchError ||
                                        'Выберите лид для факторинга'
                                    }
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            name='debSumm'
                            label='Дебиторская сумма'
                            value={form.debSumm}
                            onChange={handleFieldChange}
                            error={Boolean(errors.debSumm)}
                            helperText={errors.debSumm}
                            fullWidth
                            size='small'
                            disabled={loading}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            select
                            name='debCurrency'
                            label='Валюта дебиторской суммы'
                            value={form.debCurrency}
                            onChange={handleFieldChange}
                            fullWidth
                            size='small'
                            disabled={loading}
                        >
                            {currencies.map((currency) => (
                                <MenuItem key={currency} value={currency}>
                                    {currency}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            select
                            name='currency'
                            label='Валюта факторинга'
                            value={form.currency}
                            onChange={handleFieldChange}
                            fullWidth
                            size='small'
                            disabled={loading}
                        >
                            {currencies.map((currency) => (
                                <MenuItem key={currency} value={currency}>
                                    {currency}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <button type='submit' hidden />
                </Grid>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Отмена
                </Button>

                <Button
                    variant='contained'
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? 'Создание...' : 'Создать'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

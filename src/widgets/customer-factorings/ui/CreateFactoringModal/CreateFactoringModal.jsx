import { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

import { CreateFactoringLead } from './CreateFactoringLead';
import { CreateFactoringFactor } from './CreateFactoringFactor';
import {
    initialCreateFactoringForm,
    mapCreateFactoringFormToApi,
    validateCreateFactoringForm,
} from '../../model/create-factoring.helpers';

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

    const [selectedLead, setSelectedLead] = useState(null);
    const [selectedFactor, setSelectedFactor] = useState(null);

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

    async function handleSubmit(event) {
        event.preventDefault();

        const nextErrors = validateCreateFactoringForm(
            form,
            selectedLead,
            selectedFactor,
        );

        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            return;
        }

        const payload = mapCreateFactoringFormToApi(
            form,
            selectedLead,
            selectedFactor,
        );

        await onSubmit(payload);
    }

    useEffect(() => {
        if (!open) {
            setForm(initialCreateFactoringForm);
            setErrors({});
            setSelectedLead(null);
            setSelectedFactor(null);
        }
    }, [open]);

    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onClose}
            fullWidth
            maxWidth='sm'
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 4,
                    },
                },
            }}
        >
            <DialogTitle
                sx={{
                    px: 3,
                    pt: 3,
                    pb: 1.5,
                }}
            >
                <Typography
                    sx={{
                        fontSize: {
                            xs: '18px',
                            sm: '20px',
                        },
                        fontWeight: 600,
                        lineHeight: 1.3,
                    }}
                >
                    Создать факторинг
                </Typography>

                <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mt: 0.5 }}
                >
                    Выберите завершённый лид, фактор и укажите параметры
                    факторинга
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ px: 3 }}>
                <Box component='form' onSubmit={handleSubmit} sx={{ pt: 1 }}>
                    <Stack spacing={2.5}>
                        {error && <Alert severity='error'>{error}</Alert>}

                        <CreateFactoringLead
                            selectedLead={selectedLead}
                            onChange={(lead) => {
                                setSelectedLead(lead);

                                setErrors((prevErrors) => ({
                                    ...prevErrors,
                                    lead: '',
                                }));
                            }}
                            error={errors.lead}
                            disabled={loading}
                        />

                        <CreateFactoringFactor
                            selectedFactor={selectedFactor}
                            onChange={(factor) => {
                                setSelectedFactor(factor);

                                setErrors((prevErrors) => ({
                                    ...prevErrors,
                                    factor: '',
                                }));
                            }}
                            error={errors.factor}
                            disabled={loading}
                        />

                        <TextField
                            name='debSumm'
                            label='Дебиторская сумма'
                            value={form.debSumm}
                            onChange={handleFieldChange}
                            error={Boolean(errors.debSumm)}
                            helperText={errors.debSumm}
                            fullWidth
                            disabled={loading}
                        />

                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: {
                                    xs: '1fr',
                                    sm: 'repeat(2, 1fr)',
                                },
                                gap: 2,
                            }}
                        >
                            <TextField
                                select
                                name='debCurrency'
                                label='Валюта дебиторской суммы'
                                value={form.debCurrency}
                                onChange={handleFieldChange}
                                fullWidth
                                disabled={loading}
                            >
                                {currencies.map((currency) => (
                                    <MenuItem key={currency} value={currency}>
                                        {currency}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                select
                                name='currency'
                                label='Валюта факторинга'
                                value={form.currency}
                                onChange={handleFieldChange}
                                fullWidth
                                disabled={loading}
                            >
                                {currencies.map((currency) => (
                                    <MenuItem key={currency} value={currency}>
                                        {currency}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        <button type='submit' hidden />
                    </Stack>
                </Box>
            </DialogContent>

            <DialogActions
                sx={{
                    px: 3,
                    pb: 3,
                    pt: 2,
                    justifyContent: 'flex-end',
                    gap: 1,
                }}
            >
                <Button onClick={onClose} disabled={loading}>
                    Отмена
                </Button>

                <Button
                    variant='contained'
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? 'Создание...' : 'Создать факторинг'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

import { useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

import {
    createForwarderInviteInitialForm,
    mapForwarderInviteFormToApi,
    validateForwarderInviteForm,
} from '../model/create-forwarder-invite.helpers';

export function CreateForwarderInviteModal({
    open,
    loading,
    error,
    createdInvite,
    onClose,
    onSubmit,
}) {
    const [form, setForm] = useState(() => createForwarderInviteInitialForm());
    const [validationError, setValidationError] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    function handleFieldChange(event) {
        const { name, value } = event.target;

        setForm((prevForm) => ({
            ...prevForm,
            [name]: value,
        }));

        setValidationError('');
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const nextValidationError = validateForwarderInviteForm(form);

        if (nextValidationError) {
            setValidationError(nextValidationError);
            return;
        }

        await onSubmit(mapForwarderInviteFormToApi(form));
    }

    async function handleCopyInviteLink() {
        if (!createdInvite?.invite_link) {
            return;
        }

        await navigator.clipboard.writeText(createdInvite.invite_link);
        setIsCopied(true);
    }

    function handleClose() {
        if (loading) {
            return;
        }

        setForm(createForwarderInviteInitialForm());
        setValidationError('');
        setIsCopied(false);
        onClose();
    }

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {createdInvite
                    ? 'Приглашение создано'
                    : 'Пригласить экспедитора'}
            </DialogTitle>

            <DialogContent>
                <Box component="form" onSubmit={handleSubmit} sx={{ pt: 1 }}>
                    <Stack spacing={2}>
                        {(validationError || error) && (
                            <Alert severity="error">
                                {validationError || error}
                            </Alert>
                        )}

                        {createdInvite ? (
                            <Stack spacing={2}>
                                <Alert severity="success">
                                    Экспедитор создан. Отправьте ему ссылку для
                                    завершения заполнения данных.
                                </Alert>

                                <TextField
                                    label="Пригласительная ссылка"
                                    value={createdInvite.invite_link || ''}
                                    fullWidth
                                    multiline
                                    minRows={2}
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                />

                                <Button
                                    variant="contained"
                                    onClick={handleCopyInviteLink}
                                    disabled={!createdInvite.invite_link}
                                >
                                    {isCopied
                                        ? 'Ссылка скопирована'
                                        : 'Скопировать ссылку'}
                                </Button>
                            </Stack>
                        ) : (
                            <>
                                <Typography
                                    fontWeight={700}
                                    sx={{ fontSize: 14 }}
                                >
                                    Представитель
                                </Typography>

                                <TextField
                                    name="fio"
                                    label="ФИО"
                                    value={form.fio}
                                    onChange={handleFieldChange}
                                    fullWidth
                                    size="small"
                                    required
                                />

                                <TextField
                                    name="phone"
                                    label="Телефон"
                                    value={form.phone}
                                    onChange={handleFieldChange}
                                    fullWidth
                                    size="small"
                                    required
                                />

                                <TextField
                                    name="iin"
                                    label="ИИН"
                                    value={form.iin}
                                    onChange={handleFieldChange}
                                    fullWidth
                                    size="small"
                                    required
                                />

                                <TextField
                                    name="email"
                                    label="Email"
                                    value={form.email}
                                    onChange={handleFieldChange}
                                    fullWidth
                                    size="small"
                                    required
                                />

                                <TextField
                                    name="document_number"
                                    label="Номер документа"
                                    value={form.document_number}
                                    onChange={handleFieldChange}
                                    fullWidth
                                    size="small"
                                />

                                <TextField
                                    name="issue_country"
                                    label="Страна выдачи документа"
                                    value={form.issue_country}
                                    onChange={handleFieldChange}
                                    fullWidth
                                    size="small"
                                />

                                <Divider />

                                <Typography
                                    fontWeight={700}
                                    sx={{ fontSize: 14 }}
                                >
                                    Компания
                                </Typography>

                                <TextField
                                    name="company_name"
                                    label="Название компании"
                                    value={form.company_name}
                                    onChange={handleFieldChange}
                                    fullWidth
                                    size="small"
                                    required
                                />

                                <TextField
                                    name="company_bin"
                                    label="БИН компании"
                                    value={form.company_bin}
                                    onChange={handleFieldChange}
                                    fullWidth
                                    size="small"
                                    required
                                />

                                <TextField
                                    name="company_account"
                                    label="Расчетный счет"
                                    value={form.company_account}
                                    onChange={handleFieldChange}
                                    fullWidth
                                    size="small"
                                />

                                <TextField
                                    name="company_bik"
                                    label="БИК"
                                    value={form.company_bik}
                                    onChange={handleFieldChange}
                                    fullWidth
                                    size="small"
                                />

                                <TextField
                                    name="company_address"
                                    label="Адрес компании"
                                    value={form.company_address}
                                    onChange={handleFieldChange}
                                    fullWidth
                                    size="small"
                                    multiline
                                    minRows={2}
                                />
                            </>
                        )}
                    </Stack>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={handleClose} disabled={loading}>
                    Закрыть
                </Button>

                {!createdInvite && (
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Создаём...' : 'Создать приглашение'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}

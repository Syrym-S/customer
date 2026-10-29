import { useState } from 'react';
import { useTranslation } from "react-i18next";
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
import { formatPhoneInput } from '../../../shared/helpers/phone-format.helpers';

export function CreateForwarderInviteModal({
    open,
    loading,
    error,
    createdInvite,
    onClose,
    onSubmit,
}) {
    const { t } = useTranslation();

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

    function handlePhoneChange(event) {
        const { value } = formatPhoneInput(event.target.value, form.phone);

        setForm((prevForm) => ({
            ...prevForm,
            phone: value,
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
                    ? t("forwarders.invite.created")
                    : t("forwarders.invite.action")}
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
                                    {t("forwarders.invite.success")}
                                </Alert>

                                <TextField
                                    label={t("forwarders.invite.link")}
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
                                        ? t("forwarders.invite.linkCopied")
                                        : t("forwarders.invite.copyLink")}
                                </Button>
                            </Stack>
                        ) : (
                            <>
                                <Typography
                                    fontWeight={700}
                                    sx={{ fontSize: 14 }}
                                >
                                    {t("forwarders.representative")}
                                </Typography>

                                <TextField
                                    name="fio"
                                    label={t("common.fields.fullName")}
                                    value={form.fio}
                                    onChange={handleFieldChange}
                                    fullWidth
                                    size="small"
                                    required
                                />

                                <TextField
                                    name="phone"
                                    label={t("common.fields.phone")}
                                    value={formatPhoneInput(form.phone).display}
                                    onChange={handlePhoneChange}
                                    fullWidth
                                    size="small"
                                    required
                                />

                                <TextField
                                    name="iin"
                                    label={t("common.fields.iin")}
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
                                    label={t("common.fields.documentNumber")}
                                    value={form.document_number}
                                    onChange={handleFieldChange}
                                    fullWidth
                                    size="small"
                                />

                                <TextField
                                    name="issue_country"
                                    label={t("forwarders.issuingCountry")}
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
                                    {t("common.fields.company")}
                                </Typography>

                                <TextField
                                    name="company_name"
                                    label={t("common.fields.companyName")}
                                    value={form.company_name}
                                    onChange={handleFieldChange}
                                    fullWidth
                                    size="small"
                                    required
                                />

                                <TextField
                                    name="company_bin"
                                    label={t("common.fields.companyBin")}
                                    value={form.company_bin}
                                    onChange={handleFieldChange}
                                    fullWidth
                                    size="small"
                                    required
                                />

                                <TextField
                                    name="company_account"
                                    label={t("common.fields.settlementAccount")}
                                    value={form.company_account}
                                    onChange={handleFieldChange}
                                    fullWidth
                                    size="small"
                                />

                                <TextField
                                    name="company_bik"
                                    label={t("common.fields.bik")}
                                    value={form.company_bik}
                                    onChange={handleFieldChange}
                                    fullWidth
                                    size="small"
                                />

                                <TextField
                                    name="company_address"
                                    label={t("common.fields.companyAddress")}
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
                    {t("common.actions.close")}
                </Button>

                {!createdInvite && (
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? t("common.actions.creating") : t("forwarders.invite.create")}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}

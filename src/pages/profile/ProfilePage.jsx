import { useEffect, useState } from 'react';

import {
    Alert,
    Box,
    Button,
    Container,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

import {
    initialProfileForm,
    mapProfileFormToChangedApi,
    mapProfileFromApi,
    validateProfileForm,
} from '../../features/profile-edit/profile-form.helpers';
import {
    fetchCustomerProfile,
    updateCustomerProfile,
} from '../../features/profile-edit/profile.api';
import { notifySuccess } from '../../shared/model/notifications.store';

export function ProfilePage() {
    const [form, setForm] = useState(initialProfileForm);
    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [initialLoadedForm, setInitialLoadedForm] =
        useState(initialProfileForm);
    const [isProfileLoading, setIsProfileLoading] = useState(false);
    const [profileLoadError, setProfileLoadError] = useState('');

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((prevForm) => ({
            ...prevForm,
            [name]: value,
        }));

        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: '',
        }));

        setSubmitError('');
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const nextErrors = validateProfileForm(form);

        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            return;
        }

        const payload = mapProfileFormToChangedApi(form, initialLoadedForm);

        if (Object.keys(payload).length === 0) {
            setSubmitError('Нет изменений для сохранения');
            return;
        }

        try {
            setIsSaving(true);
            setSubmitError('');

            await updateCustomerProfile(payload);

            const nextInitialForm = {
                ...form,
                currentPassword: '',
                newPassword: '',
                newPasswordConfirm: '',
            };

            setInitialLoadedForm(nextInitialForm);
            setForm(nextInitialForm);

            notifySuccess('Профиль успешно обновлен');
        } catch (error) {
            setSubmitError(
                error.response?.data?.message ||
                    error.message ||
                    'Не удалось обновить профиль',
            );
        } finally {
            setIsSaving(false);
        }
    }

    useEffect(() => {
        let isCancelled = false;

        async function loadProfile() {
            try {
                setIsProfileLoading(true);
                setProfileLoadError('');

                const profile = await fetchCustomerProfile();

                if (!isCancelled) {
                    const mappedProfile = mapProfileFromApi(profile);

                    setForm(mappedProfile);
                    setInitialLoadedForm(mappedProfile);
                    setErrors({});
                    setSubmitError('');
                }
            } catch (error) {
                if (!isCancelled) {
                    setProfileLoadError(
                        error.response?.data?.message ||
                            error.message ||
                            'Не удалось загрузить профиль',
                    );
                }
            } finally {
                if (!isCancelled) {
                    setIsProfileLoading(false);
                }
            }
        }

        loadProfile();

        return () => {
            isCancelled = true;
        };
    }, []);

    return (
        <Container maxWidth='md' sx={{ py: 3 }}>
            <Paper
                component='form'
                onSubmit={handleSubmit}
                sx={{
                    p: {
                        xs: 2,
                        sm: 3,
                    },
                    borderRadius: 3,
                }}
            >
                <Stack spacing={3}>
                    <Box>
                        <Typography variant='h6' fontWeight={600}>
                            Профиль
                        </Typography>

                        <Typography color='text.secondary' fontSize={14}>
                            Данные компании и контактного лица
                        </Typography>
                    </Box>

                    {profileLoadError && (
                        <Alert severity='error'>{profileLoadError}</Alert>
                    )}

                    {submitError && (
                        <Alert severity='error'>{submitError}</Alert>
                    )}

                    <Stack spacing={2}>
                        <Typography fontWeight={600}>
                            Компания и реквизиты
                        </Typography>

                        <TextField
                            name='fullName'
                            label='Название'
                            value={form.fullName}
                            onChange={handleChange}
                            error={Boolean(errors.fullName)}
                            helperText={errors.fullName}
                            fullWidth
                        />

                        <TextField
                            name='bin'
                            label='БИН'
                            value={form.bin}
                            onChange={handleChange}
                            error={Boolean(errors.bin)}
                            helperText={errors.bin}
                            fullWidth
                        />

                        <TextField
                            name='bik'
                            label='БИК'
                            value={form.bik}
                            onChange={handleChange}
                            error={Boolean(errors.bik)}
                            helperText={errors.bik}
                            fullWidth
                        />

                        <TextField
                            name='accountNumber'
                            label='ИИК'
                            value={form.accountNumber}
                            onChange={handleChange}
                            error={Boolean(errors.accountNumber)}
                            helperText={errors.accountNumber}
                            fullWidth
                        />

                        <TextField
                            name='legalAddress'
                            label='Юридический адрес'
                            value={form.legalAddress}
                            onChange={handleChange}
                            error={Boolean(errors.legalAddress)}
                            helperText={errors.legalAddress}
                            fullWidth
                        />

                        <TextField
                            name='bankName'
                            label='Название банка'
                            value={form.bankName}
                            onChange={handleChange}
                            error={Boolean(errors.bankName)}
                            helperText={errors.bankName}
                            fullWidth
                        />
                    </Stack>

                    <Stack spacing={2}>
                        <Typography fontWeight={600}>
                            Контактное лицо
                        </Typography>

                        <TextField
                            name='personFio'
                            label='ФИО'
                            value={form.personFio}
                            onChange={handleChange}
                            fullWidth
                        />

                        <TextField
                            name='personPhone'
                            label='Телефон'
                            value={form.personPhone}
                            onChange={handleChange}
                            fullWidth
                        />

                        <TextField
                            name='personEmail'
                            label='Email'
                            value={form.personEmail}
                            onChange={handleChange}
                            error={Boolean(errors.personEmail)}
                            helperText={errors.personEmail}
                            fullWidth
                        />

                        <TextField
                            name='personIin'
                            label='ИИН'
                            value={form.personIin}
                            onChange={handleChange}
                            error={Boolean(errors.personIin)}
                            helperText={errors.personIin}
                            fullWidth
                        />
                    </Stack>

                    <Stack spacing={2}>
                        <Typography fontWeight={600}>Смена пароля</Typography>

                        <TextField
                            name='profileCurrentPassword'
                            label='Текущий пароль'
                            type='password'
                            value={form.currentPassword}
                            onChange={(event) => {
                                handleChange({
                                    target: {
                                        name: 'currentPassword',
                                        value: event.target.value,
                                    },
                                });
                            }}
                            error={Boolean(errors.currentPassword)}
                            helperText={errors.currentPassword}
                            fullWidth
                            autoComplete='new-password'
                            inputProps={{
                                autoComplete: 'new-password',
                                readOnly: true,
                                onFocus: (event) => {
                                    event.target.removeAttribute('readonly');
                                },
                            }}
                        />

                        <TextField
                            name='newPassword'
                            label='Новый пароль'
                            type='password'
                            value={form.newPassword}
                            onChange={handleChange}
                            error={Boolean(errors.newPassword)}
                            helperText={errors.newPassword}
                            fullWidth
                            autoComplete='new-password'
                            inputProps={{
                                autoComplete: 'new-password',
                            }}
                        />

                        <TextField
                            name='newPasswordConfirm'
                            label='Повторите новый пароль'
                            type='password'
                            value={form.newPasswordConfirm}
                            onChange={handleChange}
                            error={Boolean(errors.newPasswordConfirm)}
                            helperText={errors.newPasswordConfirm}
                            fullWidth
                            autoComplete='new-password'
                            inputProps={{
                                autoComplete: 'new-password',
                            }}
                        />
                    </Stack>

                    <Stack spacing={2}>
                        <Typography fontWeight={600}>Документ</Typography>

                        <TextField
                            name='documentNumber'
                            label='Номер документа'
                            value={form.documentNumber}
                            onChange={handleChange}
                            error={Boolean(errors.documentNumber)}
                            helperText={errors.documentNumber}
                            fullWidth
                        />

                        <TextField
                            name='issueCountry'
                            label='Страна выдачи'
                            value={form.issueCountry}
                            onChange={handleChange}
                            error={Boolean(errors.issueCountry)}
                            helperText={errors.issueCountry}
                            fullWidth
                        />
                    </Stack>

                    <Box>
                        <Button
                            type='submit'
                            variant='contained'
                            disabled={isSaving || isProfileLoading}
                        >
                            {isSaving ? 'Сохранение...' : 'Сохранить'}
                        </Button>
                    </Box>
                </Stack>
            </Paper>
        </Container>
    );
}

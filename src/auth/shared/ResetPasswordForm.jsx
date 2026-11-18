import AuthHeader from "./AuthHeader";
import { useAuthTranslation } from "../i18n/useAuthTranslation";
import FormInput from './FormInput';
import FormButton from './FormButton';
import {
  Box,
  Typography,
  Divider,
  Alert,
} from '@mui/material';
import { Link, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { resetPasswordRequest } from '../api/auth';

export function ResetPasswordForm({
  loginPath = '/auth/login',
  ButtonComponent: buttonComponent = FormButton,
  InputComponent: inputComponent = FormInput,
}) {
  const { t, localized } = useAuthTranslation();
  const InputComponent = inputComponent;
  const ButtonComponent = buttonComponent;
  const [searchParams] = useSearchParams();

  const userId = searchParams.get('user_id');
  const resetToken = searchParams.get('reset_token');

  const hasResetParams = Boolean(userId && resetToken);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      password: '',
      password_confirm: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    setError('');
    setSuccessMessage('');

    if (!hasResetParams) {
      setError('Ссылка для сброса пароля некорректна или устарела');
      return;
    }

    try {
      const response = await resetPasswordRequest({
        user_id: Number(userId),
        token: resetToken,
        password: data.password,
        password_confirm: data.password_confirm,
      });

      setSuccessMessage(response?.data?.message || 'Пароль успешно изменён');

      reset({
        password: '',
        password_confirm: '',
      });
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'Не удалось отправить ссылку для сброса пароля',
      );
    }
  };

  return (
    <>
      <AuthHeader languageSelect={localized ? undefined : null}>
        {t("Новый пароль")}
      </AuthHeader>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t("Придумайте новый пароль для входа в аккаунт.")}
      </Typography>

      {!hasResetParams && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t("Ссылка для сброса пароля некорректна. Запросите новую ссылку.")}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t(error)}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {t("Пароль успешно изменён. Теперь можно войти с новым паролем.")}
        </Alert>
      )}

      {!successMessage && (
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <InputComponent
            type="password"
            fullWidth
            label={t("Новый пароль")}
            margin="normal"
            error={!!errors.password}
            helperText={t(errors.password?.message)}
            disabled={!hasResetParams || isSubmitting}
            {...register('password', {
              required: 'Введите новый пароль',
              minLength: {
                value: 6,
                message: 'Минимум 6 символов',
              },
            })}
          />

          <InputComponent
            type="password"
            fullWidth
            label={t("Повторите пароль")}
            margin="normal"
            error={!!errors.password_confirm}
            helperText={t(errors.password_confirm?.message)}
            disabled={!hasResetParams || isSubmitting}
            {...register('password_confirm', {
              required: 'Подтвердите пароль',
              validate: (value) => value === password || 'Пароли не совпадают',
            })}
          />

          <ButtonComponent
            fullWidth
            type="submit"
            variant="contained"
            sx={{ mt: 2 }}
            disabled={!hasResetParams || isSubmitting}
          >
            {isSubmitting ? t('Сохраняем...') : t('Сбросить пароль')}
          </ButtonComponent>
        </Box>
      )}

      <Box mt={3}>
        <Divider sx={{ mb: 2 }} />

        <ButtonComponent component={Link} to={loginPath} fullWidth variant="outlined">
          {t("Вернуться ко входу")}
        </ButtonComponent>
      </Box>
    </>
  );
}

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
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { forgotPasswordRequest } from '../api/auth';

export function ForgotPasswordForm({
  loginPath = '/auth/login',
  ButtonComponent: buttonComponent = FormButton,
  InputComponent: inputComponent = FormInput,
}) {
  const { t, localized } = useAuthTranslation();
  const InputComponent = inputComponent;
  const ButtonComponent = buttonComponent;
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data) => {
    setError('');
    setSuccessMessage('');

    try {
      const response = await forgotPasswordRequest({
        email: data.email,
      });

      setSuccessMessage(
        response?.data?.message ||
          'Ссылка для сброса пароля была отправлена на указанную почту',
      );
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
        {t("Восстановление пароля")}
      </AuthHeader>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t("Введите email, указанный при регистрации. Мы отправим ссылку для сброса пароля.")}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t(error)}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {t(successMessage)}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <InputComponent
          fullWidth
          label={t("Email")}
          type="email"
          margin="normal"
          error={!!errors.email}
          helperText={t(errors.email?.message)}
          {...register('email', {
            required: 'Введите email',
            pattern: {
              value: /^\S+@\S+\.\S+$/,
              message: 'Некорректный email',
            },
          })}
        />

        <ButtonComponent
          fullWidth
          type="submit"
          variant="contained"
          sx={{ mt: 2 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? t('Отправляем...') : t('Отправить ссылку')}
        </ButtonComponent>
      </Box>

      <Box mt={3}>
        <Divider sx={{ mb: 2 }} />

        <ButtonComponent component={Link} to={loginPath} fullWidth variant="outlined">
          {t("Вернуться ко входу")}
        </ButtonComponent>
      </Box>
    </>
  );
}

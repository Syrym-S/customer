import AuthHeader from "../shared/AuthHeader";
import { useAuthTranslation } from "../i18n/useAuthTranslation";
import FormButton from "../shared/FormButton";
import FormInput from "../shared/FormInput";
import { Box, Divider, Alert } from "@mui/material";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useState } from "react";
import { loginRequest } from "../api/auth";
import { useForm } from "react-hook-form";
import { isStaging } from "../api/client";
import { getLoginErrorMessage } from "../shared/login-error.helpers";
import { NotRegisteredModal } from "../shared/NotRegisteredModal";
import { EcpLoginButton } from "../shared/EcpLoginButton";
import {
  getEcpRedirectErrorMessage,
  isEcpPendingRegistration,
} from "../shared/ecp-login.helpers";
import {
  getVerifyRegistered,
  getSupportContacts,
  getRegistrationNotVerifiedError,
  getAppDataSupportContacts,
} from "../shared/verify-registered.helpers";

export default function Login() {
  const { t } = useAuthTranslation();
  const [error, setError] = useState(getEcpRedirectErrorMessage);
  const [isNotRegisteredOpen, setIsNotRegisteredOpen] = useState(
    isEcpPendingRegistration,
  );
  const [support, setSupport] = useState(() =>
    isEcpPendingRegistration() ? getAppDataSupportContacts() : null,
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setError("");

    try {
      const res = await loginRequest(data, window?.APP_DATA?.nonce);

      if (res.data?.error) {
        throw new Error(res.data.error);
      }

      if (!getVerifyRegistered(res)) {
        setSupport(getSupportContacts(res));
        setIsNotRegisteredOpen(true);
        return;
      }

      const redirectUrl = res?.redirect_url || res?.data?.redirect_url;

      if (redirectUrl) {
        window.location.assign(redirectUrl);
        return;
      } else {
        window.location.assign(isStaging ? "/staging/customer" : "/customer");
      }
    } catch (e) {
      const notVerifiedSupport = getRegistrationNotVerifiedError(e);

      if (notVerifiedSupport) {
        setSupport(notVerifiedSupport);
        setIsNotRegisteredOpen(true);
        return;
      }

      setError(getLoginErrorMessage(e));
    }
  };

  return (
    <AuthLayout>
      <NotRegisteredModal open={isNotRegisteredOpen} support={support} />

      <AuthHeader>
        {t("Вход")}
      </AuthHeader>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t(error)}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <FormInput
          fullWidth
          label={t("Email")}
          margin="normal"
          error={!!errors.email}
          helperText={t(errors.email?.message)}
          {...register("email", {
            required: "Введите email",
            pattern: {
              value: /^\S+@\S+\.\S+$/,
              message: "Некорректный email",
            },
          })}
        />

        <FormInput
          type="password"
          fullWidth
          label={t("Password")}
          margin="normal"
          error={!!errors.password}
          helperText={t(errors.password?.message)}
          {...register("password", {
            required: "Введите пароль",
            minLength: {
              value: 6,
              message: "Минимум 6 символов",
            },
          })}
        />

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
          <FormButton
            variant="text"
            component={Link}
            to="/auth/forgot-password"
            size="small"
            sx={{ px: 0 }}
          >
            {t("Забыли пароль?")}
          </FormButton>
        </Box>

        <FormButton
          fullWidth
          type="submit"
          variant="contained"
          sx={{ mt: 2 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? t("Загрузка...") : t("Войти")}
        </FormButton>
      </Box>

      <Box mt={3}>
        <Divider sx={{ mb: 2 }} />

        <EcpLoginButton
          onError={setError}
          disabled={isSubmitting}
          sx={{ mb: 2 }}
        />

        <FormButton
          component={Link}
          to="/auth/register"
          fullWidth
          variant="outlined"
        >
          {t("Регистрация")}
        </FormButton>
      </Box>
    </AuthLayout>
  );
}

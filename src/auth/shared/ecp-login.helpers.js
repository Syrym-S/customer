import { getFeatureFlags } from "../../shared/model/feature-flags.store";

const ECP_PENDING_CODE = "pending";

const ECP_REDIRECT_MESSAGES = {
  unauth: "В доступе отказано",
  failed: "Учётная запись не зарегистрирована",
};

function getEcpRedirectCode() {
  if (typeof window === "undefined") {
    return "";
  }

  return new URLSearchParams(window.location.search).get("ecp") || "";
}

export function isEcpLoginEnabled() {
  return getFeatureFlags().login_ecp === true;
}

export function isEcpPendingRegistration() {
  return getEcpRedirectCode() === ECP_PENDING_CODE;
}

export function getEcpRedirectErrorMessage() {
  const code = getEcpRedirectCode();

  if (!code || code === ECP_PENDING_CODE) {
    return "";
  }

  return (
    ECP_REDIRECT_MESSAGES[code] ||
    "Не удалось войти по ЭЦП. Попробуйте ещё раз."
  );
}

export function getEcpRequestErrorMessage(error) {
  if (error?.response?.status === 503) {
    return "Сервис подписи недоступен. Попробуйте позже.";
  }

  return "Не удалось начать вход по ЭЦП. Попробуйте позже.";
}

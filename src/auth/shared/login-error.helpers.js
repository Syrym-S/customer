export function getLoginErrorMessage(error) {
  const backendError = error?.response?.data?.error;

  if (
    typeof backendError === "string" &&
    backendError.trim().toLowerCase() === "invalid credentials"
  ) {
    return "Неверный email или пароль";
  }

  return "Ошибка входа. Попробуйте позже.";
}

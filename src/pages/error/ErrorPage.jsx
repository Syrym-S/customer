import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from "react-router-dom";
import { useTranslation } from "react-i18next";

import { ErrorScreen } from "../../shared/ui/ErrorScreen";

export function ErrorPage() {
  const { t } = useTranslation();

  const error = useRouteError();
  const navigate = useNavigate();

  let message = t("errors.unexpected");

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      message = t("errors.notFound");
    } else if (error.status >= 500) {
      message = t("errors.server");
    } else {
      message = error.statusText || message;
    }
  }

  return (
    <ErrorScreen
      code={error?.status === 404 ? 404 : null}
      message={message}
      onBack={() => navigate(-1)}
    />
  );
}

import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from "react-router-dom";

import { ErrorScreen } from "../../shared/ui/ErrorScreen";

export function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  let message = "Произошла непредвиденная ошибка.";

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      message = "Запрашиваемая страница не найдена.";
    } else if (error.status >= 500) {
      message = "Произошла ошибка на сервере. Попробуйте позже.";
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

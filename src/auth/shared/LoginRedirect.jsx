import { Navigate, useLocation } from "react-router-dom";

export function LoginRedirect() {
  const { search } = useLocation();

  return <Navigate to={{ pathname: "/auth/login", search }} replace />;
}

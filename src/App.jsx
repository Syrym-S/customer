import { CssBaseline, ThemeProvider } from "@mui/material";
import { theme } from "./theme/theme";
// import { EmailVerificationWatcher } from "./features/verify-email/ui/EmailVerificationWatcher";
import { router } from "./router/router";
import { RouterProvider } from "react-router-dom";
import { NotificationToasts } from "./widgets/notification-toasts/ui/NotificationToasts";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
      {/* <EmailVerificationWatcher /> */}
      <NotificationToasts />
    </ThemeProvider>
  );
}

export default App;

import { CssBaseline, ThemeProvider } from "@mui/material";
import { theme } from "./theme/theme";
import { NotificationsColumn } from "./shared/ui/NotificationsColumn";
import { EmailVerificationWatcher } from "./widgets/customer-verification/ui/EmailVerificationWatcher";
import { router } from "./router/router";
import { RouterProvider } from "react-router-dom";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
      <EmailVerificationWatcher />
      <NotificationsColumn />
    </ThemeProvider>
  );
}

export default App;

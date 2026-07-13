import { BrowserRouter } from "react-router-dom";
import { AppRouter } from "./router/AppRouter";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { theme } from "./theme/theme";
import { NotificationsColumn } from "./shared/ui/NotificationsColumn";
// import { EmailVerificationWatcher } from "./widgets/customer-verification/ui/EmailVerificationWatcher";
import { isStaging } from "./shared/api/api-client";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter basename={isStaging ? "/staging" : ""}>
        <AppRouter />
      </BrowserRouter>
      {/* <EmailVerificationWatcher /> */}
      <NotificationsColumn />
    </ThemeProvider>
  );
}

export default App;

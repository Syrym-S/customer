import { CssBaseline, ThemeProvider } from "@mui/material";
import { theme } from "./theme/theme";
import { NotificationsColumn } from "./shared/ui/NotificationsColumn";
import { MobileViewportModal } from "./shared/ui/MobileViewportModal";
import { ContractGateModal } from "./shared/ui/ContractGateModal";
import { router } from "./router/router";
import { RouterProvider } from "react-router-dom";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
      <NotificationsColumn />
      <MobileViewportModal />
      <ContractGateModal />
    </ThemeProvider>
  );
}

export default App;

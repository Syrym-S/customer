import { Box, CircularProgress, CssBaseline, ThemeProvider } from "@mui/material";
import { theme } from "./theme/theme";
import { NotificationsColumn } from "./shared/ui/NotificationsColumn";
import { MobileViewportModal } from "./shared/ui/MobileViewportModal";
import { ContractGateModal } from "./shared/ui/ContractGateModal";
import { useContractGate } from "./shared/model/useContractGate";
import { router } from "./router/router";
import { RouterProvider } from "react-router-dom";

function App() {
  // Holds off mounting the router (and the data-fetching effects of the
  // tenders/factorings/leads/profile/notifications providers it renders)
  // until the first contract check resolves — otherwise those requests fire
  // immediately on mount and race ahead of the mocked check's artificial
  // delay, bypassing the apiClient contract-gate interceptor entirely.
  const hasValidContract = useContractGate();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {hasValidContract === null ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          <RouterProvider router={router} />
          <NotificationsColumn />
          <MobileViewportModal />
          <ContractGateModal />
        </>
      )}
    </ThemeProvider>
  );
}

export default App;

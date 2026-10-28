import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { theme } from "./theme/theme";
import { appBasename } from "./shared/api/api-client";
import { AppErrorBoundary } from "./shared/ui/AppErrorBoundary";
import { SharedLeadLayout } from "./widgets/shared-lead/ui/SharedLeadLayout";
import { SharedLeadPage } from "./pages/shared-lead/SharedLeadPage";
import { SharedLeadNotFound } from "./pages/shared-lead/SharedLeadNotFound";

function PublicApp() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <AppErrorBoundary>
        <BrowserRouter basename={appBasename}>
          <Routes>
            <Route
              path="shared/:leadId/:token"
              element={<SharedLeadLayout />}
            >
              <Route index element={<SharedLeadPage />} />
            </Route>

            <Route path="*" element={<SharedLeadNotFound />} />
          </Routes>
        </BrowserRouter>
      </AppErrorBoundary>
    </ThemeProvider>
  );
}

export default PublicApp;

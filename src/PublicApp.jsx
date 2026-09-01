import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { theme } from "./theme/theme";
import { isStaging } from "./shared/api/api-client";
import { SharedLeadLayout } from "./widgets/shared-lead/ui/SharedLeadLayout";
import { SharedLeadPage } from "./pages/shared-lead/SharedLeadPage";

function PublicApp() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <BrowserRouter basename={isStaging ? "/staging" : "/"}>
        <Routes>
          <Route
            path="shared/:leadId/:token"
            element={<SharedLeadLayout />}
          >
            <Route index element={<SharedLeadPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default PublicApp;

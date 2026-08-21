import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { theme } from "./theme/theme";
import { isStaging } from "./shared/api/api-client";
import { SharedLeadLayout } from "./widgets/shared-lead/ui/SharedLeadLayout";
import { SharedLeadPage } from "./pages/shared-lead/SharedLeadPage";

// Only route this standalone entry serves. WordPress now serves this exact
// path (/shared/{id}/{token}, no "customer" segment) via the separately
// deployed public bundle (see main-public.jsx / vite.config.public.js /
// deploy.js) rather than routing it through the main app's index.js — so
// this no longer needs to match a "customer/..."-prefixed path the way
// router.jsx's routes do.
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

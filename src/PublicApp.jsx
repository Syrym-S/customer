import { useMemo } from "react";
import { CacheProvider } from "@emotion/react";
import { useTranslation } from "react-i18next";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { createAppTheme } from "./theme/theme";
import { createEmotionCache } from "./theme/createEmotionCache";
import { getLanguageDirection } from "./shared/i18n/language";
import { appBasename } from "./shared/api/api-client";
import { AppErrorBoundary } from "./shared/ui/AppErrorBoundary";
import { SharedLeadLayout } from "./widgets/shared-lead/ui/SharedLeadLayout";
import { SharedLeadPage } from "./pages/shared-lead/SharedLeadPage";
import { SharedLeadNotFound } from "./pages/shared-lead/SharedLeadNotFound";

function PublicApp() {
  const { i18n } = useTranslation();
  const direction = getLanguageDirection(i18n.resolvedLanguage);

  const emotionCache = useMemo(
    () => createEmotionCache(direction),
    [direction],
  );
  const theme = useMemo(() => createAppTheme(direction), [direction]);

  return (
    <CacheProvider value={emotionCache}>
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
    </CacheProvider>
  );
}

export default PublicApp;

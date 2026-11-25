import { useEffect } from "react";
import { Box, CircularProgress } from "@mui/material";
import { Outlet } from "react-router-dom";
import { Header } from "../header/Header";
import { AppBreadcrumbs } from "../../router/AppBreadcrumbs";
import { DocumentTitleManager } from "../../router/DocumentTitleManager";
import { ChatWidget } from "../chat-widget/ui/ChatWidget";
import { usePushNavigation } from "../customer-notifications/model/usePushNavigation";
import { NotificationNavigationWatcher } from "../customer-notifications/ui/NotificationNavigationWatcher";
import { usePushNotificationsStore } from "../customer-notifications/model/push-notifications.store";
import { useSessionGuard } from "../../shared/model/useSessionGuard";
import { useAndroidBackButton } from "../../shared/model/useAndroidBackButton";
import { useFeatureFlagsStore } from "../../shared/model/feature-flags.store";
import { loadSupportContacts } from "../../shared/model/support-contacts.store";

export function AppLayout() {
  const isAuthorized = useSessionGuard();

  useAndroidBackButton();

  usePushNavigation();

  const initPush = usePushNotificationsStore((state) => state.init);
  const areFeatureFlagsLoaded = useFeatureFlagsStore((state) => state.isLoaded);
  const loadFeatureFlags = useFeatureFlagsStore((state) => state.load);

  useEffect(() => {
    if (!isAuthorized) {
      return;
    }

    loadFeatureFlags();
    loadSupportContacts();
  }, [isAuthorized, loadFeatureFlags]);

  // Токен может смениться сам, поэтому его сверяют на каждом запуске, а не
  // только когда пользователь зайдёт в настройки.
  useEffect(() => {
    if (!isAuthorized) {
      return;
    }

    initPush().catch(() => {});
  }, [initPush, isAuthorized]);

  if (!isAuthorized) {
    return null;
  }

  if (!areFeatureFlagsLoaded) {
    return (
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
    );
  }

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <NotificationNavigationWatcher />

      <DocumentTitleManager />

      <Header />

      <Box
        component="main"
        sx={{
          ml: {
            xs: 0,
            sm: "max(20vw, 220px)",
          },
        }}
      >
        <AppBreadcrumbs />

        <Outlet />
      </Box>

      <ChatWidget />
    </Box>
  );
}

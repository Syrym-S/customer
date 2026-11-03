import { useEffect } from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { Header } from "../header/Header";
import { AppBreadcrumbs } from "../../router/AppBreadcrumbs";
import { DocumentTitleManager } from "../../router/DocumentTitleManager";
import { ChatWidget } from "../chat-widget/ui/ChatWidget";
import { usePushNavigation } from "../customer-notifications/model/usePushNavigation";
import { usePushNotificationsStore } from "../customer-notifications/model/push-notifications.store";

export function AppLayout() {
  usePushNavigation();

  const initPush = usePushNotificationsStore((state) => state.init);

  // Токен может смениться сам, поэтому его сверяют на каждом запуске, а не
  // только когда пользователь зайдёт в настройки.
  useEffect(() => {
    initPush().catch(() => {});
  }, [initPush]);

  return (
    <Box sx={{ minHeight: "100vh" }}>
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

import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { Header } from "../header/Header";
import { AppBreadcrumbs } from "../../router/AppBreadcrumbs";
import { ChatWidget } from "../chat-widget/ui/ChatWidget";

export function AppLayout() {
  return (
    <Box sx={{ minHeight: "100vh" }}>
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

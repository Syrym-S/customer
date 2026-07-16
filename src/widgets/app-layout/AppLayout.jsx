import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { Header } from "../header/Header";
import { AppBreadcrumbs } from "../../router/AppBreadcrumbs";
import { CUSTOMER_NAV_WIDTH } from "../../shared/config/constants";

export function AppLayout() {
  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Header />

      <Box
        component="main"
        sx={{
          ml: {
            xs: 0,
            sm: `${CUSTOMER_NAV_WIDTH}px`,
          },
        }}
      >
        <AppBreadcrumbs />

        <Outlet />
      </Box>
    </Box>
  );
}

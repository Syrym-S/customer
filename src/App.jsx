import { CssBaseline, ThemeProvider } from "@mui/material";
import { theme } from "./theme/theme";
import { NotificationsColumn } from "./shared/ui/NotificationsColumn";
import { router } from "./router/router";
import { RouterProvider } from "react-router-dom";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
      <NotificationsColumn />
    </ThemeProvider>
  );
}

export default App;

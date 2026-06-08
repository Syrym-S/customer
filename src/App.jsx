import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './router/AppRouter';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from './theme/theme';
import { NotificationsColumn } from './shared/ui/NotificationsColumn';

function App() {
   return (
      <ThemeProvider theme={theme}>
         <CssBaseline />
         <BrowserRouter>
            <AppRouter />
         </BrowserRouter>
         <NotificationsColumn />
      </ThemeProvider>
   );
}

export default App;

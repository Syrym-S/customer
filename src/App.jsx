import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './router/AppRouter';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from './theme/theme';

function App() {
   return (
      <ThemeProvider theme={theme}>
         <CssBaseline />
         <BrowserRouter>
            <AppRouter />
         </BrowserRouter>
      </ThemeProvider>
   );
}

export default App;

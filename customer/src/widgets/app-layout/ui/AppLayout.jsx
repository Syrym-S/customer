import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Header } from '../../header/ui/Header';

export function AppLayout() {
   return (
      <Box sx={{ minHeight: '100vh' }}>
         <Header />

         <Box component='main'>
            <Outlet />
         </Box>
      </Box>
   );
}

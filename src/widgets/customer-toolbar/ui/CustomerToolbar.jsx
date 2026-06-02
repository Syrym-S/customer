import { Box } from '@mui/material';
import { CreateRouteButton } from '../../../features/create-route';

export function CustomerToolbar() {
   return (
      <Box
         sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 2,
         }}
      >
         <CreateRouteButton />
      </Box>
   );
}

import { Box } from '@mui/material';
import { CreateTenderButton } from './CreateTenderButton';

export function TendersToolbar() {
   return (
      <Box
         sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 2,
            mb: 3,
         }}
      >
         <CreateTenderButton />
      </Box>
   );
}

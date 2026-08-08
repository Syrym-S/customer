import { Box } from '@mui/material';
import { CreateLeadButton } from '../../features/create-lead/ui/CreateLeadButton';

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
         <CreateLeadButton />
      </Box>
   );
}

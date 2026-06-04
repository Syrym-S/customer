import { Box, Container } from '@mui/material';
import { CustomerMap } from '../../../widgets/customer-map';
import { CustomerToolbar } from '../../../widgets/customer-toolbar';
import { LeadsList } from '../../../widgets/customer-leads/ui/LeadsList';

export function CustomerPage() {
   return (
      <Container maxWidth={false}>
         <Box
            sx={{
               width: {
                  xs: '100%',
                  md: '85%',
                  lg: '78%',
               },
               maxWidth: 1200,
               mx: 'auto',
               py: 3,
            }}
         >
            <CustomerMap />
            <CustomerToolbar />
            <LeadsList />
         </Box>
      </Container>
   );
}

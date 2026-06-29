import { Box, Container } from '@mui/material';
import { CustomerMap } from '../../widgets/customer-map/ui/CustomerMap';
import { CustomerToolbar } from '../../widgets/customer-toolbar/CustomerToolbar';
import { LeadsList } from '../../widgets/customer-leads/ui/LeadsList';
import { LeadsProvider } from '../../widgets/customer-leads/model/LeadsProvider';

export function LeadsPage() {
   return (
      <LeadsProvider>
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
      </LeadsProvider>
   );
}

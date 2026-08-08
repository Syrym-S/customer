import { Box, Container } from '@mui/material';
import { LeadsToolbar } from '../../widgets/leads-list/ui/LeadsToolbar';
import { LeadsList } from '../../widgets/leads-list/ui/LeadsList';
import { LeadsProvider } from '../../entities/lead/model/LeadsProvider';
import { LeadDetailsRouteSync } from '../../widgets/lead-details/ui/LeadDetailsRouteSync';
import { LeadsMap } from '../../widgets/leads-map/ui/LeadsMap';

export function LeadsPage() {
   return (
      <LeadsProvider>
         <LeadDetailsRouteSync />

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
               <LeadsMap />
               <LeadsToolbar />
               <LeadsList />
            </Box>
         </Container>
      </LeadsProvider>
   );
}

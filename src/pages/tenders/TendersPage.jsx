import { Box, Container } from '@mui/material';
import { TendersToolbar } from '../../widgets/tenders-list/ui/TendersToolbar';
import { TendersList } from '../../widgets/tenders-list/ui/TendersList';
import { TendersProvider } from '../../entities/tender/model/TendersProvider';
import { TenderDetailsRouteSync } from '../../widgets/tender-details/ui/components/TenderDetailsRouteSync';

export function TendersPage() {
   return (
      <TendersProvider>
         <TenderDetailsRouteSync />

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
               <TendersToolbar />
               <TendersList />
            </Box>
         </Container>
      </TendersProvider>
   );
}

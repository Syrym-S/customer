import { Box, Container } from '@mui/material';
import { TendersToolbar } from '../../widgets/customer-tenders/ui/TendersToolbar';
import { TendersList } from '../../widgets/customer-tenders/ui/TendersList';
import { TendersProvider } from '../../widgets/customer-tenders/model/TendersProviders';

export function TenderPage() {
   return (
      <TendersProvider>
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

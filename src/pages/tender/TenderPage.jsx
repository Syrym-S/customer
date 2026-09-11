import { TendersList } from '../../widgets/customer-tenders/ui/TendersList';
import { TendersProvider } from '../../widgets/customer-tenders/model/TendersProviders';
import { TenderDetailsRouteSync } from '../../widgets/customer-tenders/ui/tender-details/TenderDetailsRouteSync';
import { PageContainer } from '../../shared/ui/PageContainer';

export function TenderPage() {
   return (
      <TendersProvider>
         <TenderDetailsRouteSync />

         <PageContainer>
               <TendersList />
         </PageContainer>
      </TendersProvider>
   );
}

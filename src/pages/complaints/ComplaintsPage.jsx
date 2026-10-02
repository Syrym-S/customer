import { PageContainer } from '../../shared/ui/PageContainer';
import { ComplaintsProvider } from '../../widgets/customer-complaints/model/ComplaintsProvider';
import { ComplaintDetailsRouteSync } from '../../widgets/customer-complaints/ui/ComplaintDetailsRouteSync';
import { ComplaintsList } from '../../widgets/customer-complaints/ui/ComplaintsList';

export function ComplaintsPage() {
   return (
      <ComplaintsProvider>
         <ComplaintDetailsRouteSync />

         <PageContainer>
            <ComplaintsList />
         </PageContainer>
      </ComplaintsProvider>
   );
}

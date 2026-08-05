import { CustomerMap } from '../../widgets/customer-map/ui/CustomerMap';
import { CustomerToolbar } from '../../widgets/customer-toolbar/CustomerToolbar';
import { LeadsList } from '../../widgets/customer-leads/ui/LeadsList';
import { LeadsProvider } from '../../widgets/customer-leads/model/LeadsProvider';
import { LeadDetailsRouteSync } from '../../widgets/customer-leads/ui/lead-details/LeadDetailsRouteSync';
import { PageContainer } from '../../shared/ui/PageContainer';

export function LeadsPage() {
   return (
      <LeadsProvider>
         <LeadDetailsRouteSync />

         <PageContainer>
               <CustomerMap />
               <CustomerToolbar />
               <LeadsList />
         </PageContainer>
      </LeadsProvider>
   );
}

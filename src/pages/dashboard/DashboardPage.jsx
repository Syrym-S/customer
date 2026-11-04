import { Fragment } from "react";

import { PageContainer } from "../../shared/ui/PageContainer";
import { LeadsProvider } from "../../widgets/customer-leads/model/LeadsProvider";
import { TendersProvider } from "../../widgets/customer-tenders/model/TendersProviders";
import { LeadDetailsModal } from "../../widgets/customer-leads/ui/LeadDetailsModal";
import { TenderDetailsModal } from "../../widgets/customer-tenders/ui/TenderDetailsModal";
import { Dashboard } from "../../widgets/dashboard/ui/Dashboard";
import { FactoringsProvider } from "../../widgets/customer-factorings/model/FactoringsProvider";
import { isFactoringEnabled } from "../../shared/config/feature-flags";

// Провайдер грузит список факторингов на монтировании, а при скрытом разделе
// этот запрос некому показывать — подменяем его на прозрачную обёртку.
const FactoringsBoundary = isFactoringEnabled ? FactoringsProvider : Fragment;


export function DashboardPage() {
  return (
    <LeadsProvider>
      <FactoringsBoundary>
        <TendersProvider initialPerPage={50}>
          <PageContainer fullWidth>
            <Dashboard />
          </PageContainer>

          <LeadDetailsModal />
          <TenderDetailsModal />
        </TendersProvider>
      </FactoringsBoundary>
    </LeadsProvider>
  );
}

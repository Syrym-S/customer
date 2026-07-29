import { Container } from "@mui/material";

import { LeadsProvider } from "../../widgets/customer-leads/model/LeadsProvider";
import { TendersProvider } from "../../widgets/customer-tenders/model/TendersProviders";
import { LeadDetailsModal } from "../../widgets/customer-leads/ui/LeadDetailsModal";
import { TenderDetailsModal } from "../../widgets/customer-tenders/ui/TenderDetailsModal";
import { Dashboard } from "../../widgets/dashboard/ui/Dashboard";
import { FactoringsProvider } from "../../widgets/customer-factorings/model/FactoringsProvider";

export function DashboardPage() {
  return (
    <LeadsProvider>
      <FactoringsProvider>
        <TendersProvider initialPerPage={50}>
          <Container maxWidth={false}>
            <Dashboard />
          </Container>

          <LeadDetailsModal />
          <TenderDetailsModal />
        </TendersProvider>
      </FactoringsProvider>
    </LeadsProvider>
  );
}

import { Fragment } from "react";
import PropTypes from "prop-types";

import { PageContainer } from "../../shared/ui/PageContainer";
import { LeadsProvider } from "../../widgets/customer-leads/model/LeadsProvider";
import { TendersProvider } from "../../widgets/customer-tenders/model/TendersProviders";
import { LeadDetailsModal } from "../../widgets/customer-leads/ui/LeadDetailsModal";
import { TenderDetailsModal } from "../../widgets/customer-tenders/ui/TenderDetailsModal";
import { Dashboard } from "../../widgets/dashboard/ui/Dashboard";
import { FactoringsProvider } from "../../widgets/customer-factorings/model/FactoringsProvider";
import {
  isFactoringEnabled,
  isTenderEnabled,
} from "../../shared/config/feature-flags";

// Провайдер грузит список факторингов на монтировании, а при скрытом разделе
// этот запрос некому показывать — подменяем его на прозрачную обёртку.
const FactoringsBoundary = isFactoringEnabled ? FactoringsProvider : Fragment;

// То же и для тендеров: без провайдера блок тендеров на дашборде не
// рендерится, поэтому и список тендеров грузить незачем. Заглушка здесь не
// Fragment, а свой passthrough — Fragment ругается на лишний пропс
// initialPerPage, который предназначен настоящему провайдеру.
function TendersPassthrough({ children }) {
  return children;
}

TendersPassthrough.propTypes = {
  children: PropTypes.node,
};

const TendersBoundary = isTenderEnabled ? TendersProvider : TendersPassthrough;


export function DashboardPage() {
  return (
    <LeadsProvider>
      <FactoringsBoundary>
        <TendersBoundary initialPerPage={50}>
          <PageContainer fullWidth>
            <Dashboard />
          </PageContainer>

          <LeadDetailsModal />
          {isTenderEnabled && <TenderDetailsModal />}
        </TendersBoundary>
      </FactoringsBoundary>
    </LeadsProvider>
  );
}

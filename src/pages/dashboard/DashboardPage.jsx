import { Container } from '@mui/material';

import { LeadsProvider } from '../../entities/lead/model/LeadsProvider';
import { TendersProvider } from '../../entities/tender/model/TendersProvider';
import { LeadDetailsModal } from '../../widgets/lead-details/ui/LeadDetailsModal';
import { TenderDetailsModal } from '../../widgets/tender-details/ui/TenderDetailsModal';
import { Dashboard } from '../../widgets/dashboard/ui/Dashboard';

export function DashboardPage() {
    return (
        <LeadsProvider>
            <TendersProvider initialPerPage={50}>
                <Container maxWidth={false}>
                    <Dashboard />
                </Container>

                <LeadDetailsModal />
                <TenderDetailsModal />
            </TendersProvider>
        </LeadsProvider>
    );
}

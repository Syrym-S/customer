import { FactoringsProvider } from '../../widgets/customer-factorings/model/FactoringsProvider';
import { FactoringDetailsRouteSync } from '../../widgets/customer-factorings/ui/factorings-details/FactoringDetailsRouteSync';
import { FactoringsContent } from '../../widgets/customer-factorings/ui/FactoringsContent';

export function FactoringsPage() {
    return (
        <FactoringsProvider>
            <FactoringDetailsRouteSync />
            <FactoringsContent />
        </FactoringsProvider>
    );
}

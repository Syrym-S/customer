import { FactoringsProvider } from '../../entities/factoring/model/FactoringsProvider';
import { FactoringDetailsRouteSync } from '../../widgets/factoring-details/ui/FactoringDetailsRouteSync';
import { FactoringsContent } from '../../widgets/factorings-list/ui/FactoringsContent';

export function FactoringsPage() {
    return (
        <FactoringsProvider>
            <FactoringDetailsRouteSync />
            <FactoringsContent />
        </FactoringsProvider>
    );
}

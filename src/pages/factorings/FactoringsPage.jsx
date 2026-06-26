import { FactoringsProvider } from '../../widgets/customer-factorings/model/FactoringsProvider';
import { FactoringsContent } from '../../widgets/customer-factorings/ui/FactoringsContent';

export function FactoringsPage() {
    return (
        <FactoringsProvider>
            <FactoringsContent />
        </FactoringsProvider>
    );
}

import { useContext } from 'react';

import { FactoringsContext } from './FactoringsContext';

export function useFactoringsContext() {
    const context = useContext(FactoringsContext);

    if (!context) {
        throw new Error(
            'useFactoringsContext must be used within FactoringsProvider',
        );
    }

    return context;
}

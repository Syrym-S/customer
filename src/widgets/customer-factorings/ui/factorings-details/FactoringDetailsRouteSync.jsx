import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useFactoringsContext } from '../../model/useFactoringsContext';

function getFactoringIndexFromPathname(pathname) {
    const match = String(pathname).match(/\/customer\/factorings\/([^/?#]+)/);

    return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function FactoringDetailsRouteSync() {
    const { factoringIndex: paramsFactoringIndex } = useParams();
    const { openFactoringDetails } = useFactoringsContext();

    const lastSyncedFactoringIndexRef = useRef(null);

    const routeFactoringIndex =
        paramsFactoringIndex ||
        getFactoringIndexFromPathname(window.location.pathname);

    useEffect(() => {
        if (!routeFactoringIndex) {
            lastSyncedFactoringIndexRef.current = null;
            return;
        }

        if (
            String(lastSyncedFactoringIndexRef.current) ===
            String(routeFactoringIndex)
        ) {
            return;
        }

        lastSyncedFactoringIndexRef.current = routeFactoringIndex;

        openFactoringDetails({
            index: routeFactoringIndex,
        });
    }, [routeFactoringIndex, openFactoringDetails]);

    return null;
}

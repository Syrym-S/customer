import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

import { useFactoringsContext } from '../../model/useFactoringsContext';

function getFactoringIdFromPathname(pathname) {
    const match = String(pathname).match(/\/customer\/factorings\/([^/?#]+)/);

    return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function FactoringDetailsRouteSync() {
    const { factoringId: paramsFactoringId } = useParams();
    const { openFactoringDetails } = useFactoringsContext();

    const lastSyncedFactoringIdRef = useRef(null);

    const routeFactoringId =
        paramsFactoringId ||
        getFactoringIdFromPathname(window.location.pathname);

    useEffect(() => {
        if (!routeFactoringId) {
            lastSyncedFactoringIdRef.current = null;
            return;
        }

        if (
            String(lastSyncedFactoringIdRef.current) ===
            String(routeFactoringId)
        ) {
            return;
        }

        lastSyncedFactoringIdRef.current = routeFactoringId;

        openFactoringDetails({
            id: routeFactoringId,
        });
    }, [routeFactoringId, openFactoringDetails]);

    return null;
}

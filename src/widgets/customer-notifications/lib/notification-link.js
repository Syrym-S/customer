import { matchRoutes } from 'react-router-dom';

import { getAppRoutes } from '../../../router/route-registry';
import { getKnownAppOrigins } from '../../../shared/lib/app-origin';

export const NOTIFICATION_LINK_IN_APP = 'in-app';
export const NOTIFICATION_LINK_EXTERNAL = 'external';
export const NOTIFICATION_LINK_NONE = 'none';

const ROLE_SEGMENT = 'customer';

const NONE_TARGET = Object.freeze({
    kind: NOTIFICATION_LINK_NONE,
    path: '',
    url: '',
});

function normalizeLink(link) {
    return String(link || '')
        .replaceAll('\\/', '/')
        .trim();
}

function parseLink(link, baseOrigin) {
    try {
        return new URL(link, baseOrigin || undefined);
    } catch {
        return null;
    }
}

function resolveRolePath(pathname) {
    const segments = String(pathname || '')
        .split('/')
        .filter(Boolean);

    const roleIndex = segments.indexOf(ROLE_SEGMENT);

    if (roleIndex === -1) {
        return '';
    }

    const restSegments = segments.slice(roleIndex + 1);

    if (!restSegments.length) {
        return `/${ROLE_SEGMENT}`;
    }

    return `/${ROLE_SEGMENT}/${restSegments.join('/')}`;
}

function isKnownAppPath(path) {
    const routes = getAppRoutes();

    if (!routes.length) {
        return false;
    }

    return Boolean(matchRoutes(routes, path));
}

export function resolveNotificationLinkTarget(link) {
    const normalizedLink = normalizeLink(link);

    if (!normalizedLink) {
        return NONE_TARGET;
    }

    const knownOrigins = getKnownAppOrigins();

    const url = parseLink(
        normalizedLink,
        knownOrigins[0] || window?.location?.origin,
    );

    if (!url) {
        return NONE_TARGET;
    }

    const externalTarget = {
        kind: NOTIFICATION_LINK_EXTERNAL,
        path: '',
        url: url.href,
    };

    if (knownOrigins.length && !knownOrigins.includes(url.origin)) {
        return externalTarget;
    }

    const appPath = resolveRolePath(url.pathname);

    if (!appPath) {
        return externalTarget;
    }

    if (!isKnownAppPath(appPath)) {
        return NONE_TARGET;
    }

    return {
        kind: NOTIFICATION_LINK_IN_APP,
        path: `${appPath}${url.search}${url.hash}`,
        url: url.href,
    };
}

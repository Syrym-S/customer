import { getCurrentUserId } from '../../../shared/helpers/current-user.helpers';

const STORAGE_KEY_PREFIX = 'customer_route_history';
const GUEST_SCOPE = 'guest';
const HISTORY_LIMIT = 8;
const POINT_KEYS = ['from', 'to'];
const COORDINATE_PRECISION = 4;

function getStorageKey() {
    const userId = getCurrentUserId();
    const scope =
        userId === null || userId === undefined || userId === ''
            ? GUEST_SCOPE
            : String(userId);

    return `${STORAGE_KEY_PREFIX}:${scope}`;
}

function createEmptyHistory() {
    return {
        from: [],
        to: [],
    };
}

function isSupportedPoint(point) {
    return POINT_KEYS.includes(point);
}

function normalizeEntry(entry) {
    if (!entry || typeof entry !== 'object') {
        return null;
    }

    const lat = Number(entry.lat);
    const lng = Number(entry.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null;
    }

    const address = String(entry.address || entry.label || '').trim();

    if (!address) {
        return null;
    }

    return {
        country: String(entry.country || '').trim(),
        region: String(entry.region || '').trim(),
        city: String(entry.city || '').trim(),
        address,
        label: String(entry.label || address).trim(),
        lat,
        lng,
    };
}

export function getRouteHistoryEntryKey(entry) {
    const normalizedEntry = normalizeEntry(entry);

    if (!normalizedEntry) {
        return '';
    }

    const lat = normalizedEntry.lat.toFixed(COORDINATE_PRECISION);
    const lng = normalizedEntry.lng.toFixed(COORDINATE_PRECISION);

    return `${normalizedEntry.address.toLowerCase()}|${lat}|${lng}`;
}

function normalizeEntries(entries) {
    if (!Array.isArray(entries)) {
        return [];
    }

    const seenKeys = new Set();

    return entries
        .map((entry) => normalizeEntry(entry))
        .filter((entry) => {
            if (!entry) {
                return false;
            }

            const key = getRouteHistoryEntryKey(entry);

            if (seenKeys.has(key)) {
                return false;
            }

            seenKeys.add(key);

            return true;
        })
        .slice(0, HISTORY_LIMIT);
}

function readHistory() {
    try {
        const raw = window.localStorage.getItem(getStorageKey());

        if (!raw) {
            return createEmptyHistory();
        }

        const parsed = JSON.parse(raw);

        if (!parsed || typeof parsed !== 'object') {
            return createEmptyHistory();
        }

        return {
            from: normalizeEntries(parsed.from),
            to: normalizeEntries(parsed.to),
        };
    } catch {
        return createEmptyHistory();
    }
}

function writeHistory(history) {
    try {
        window.localStorage.setItem(
            getStorageKey(),
            JSON.stringify(history),
        );
    } catch {
        return;
    }
}

export function clearRouteHistory() {
    try {
        window.localStorage.removeItem(getStorageKey());
    } catch {
        return;
    }
}

export function readRouteHistoryPoint(point) {
    if (!isSupportedPoint(point)) {
        return [];
    }

    return readHistory()[point];
}

export function pushRouteHistoryEntry(point, entry) {
    if (!isSupportedPoint(point)) {
        return;
    }

    const normalizedEntry = normalizeEntry(entry);

    if (!normalizedEntry) {
        return;
    }

    const history = readHistory();
    const entryKey = getRouteHistoryEntryKey(normalizedEntry);

    history[point] = [
        normalizedEntry,
        ...history[point].filter(
            (item) => getRouteHistoryEntryKey(item) !== entryKey,
        ),
    ].slice(0, HISTORY_LIMIT);

    writeHistory(history);
}

export function removeRouteHistoryEntry(point, entry) {
    if (!isSupportedPoint(point)) {
        return [];
    }

    const entryKey = getRouteHistoryEntryKey(entry);

    if (!entryKey) {
        return readRouteHistoryPoint(point);
    }

    const history = readHistory();

    history[point] = history[point].filter(
        (item) => getRouteHistoryEntryKey(item) !== entryKey,
    );

    writeHistory(history);

    return history[point];
}

export function pushRouteHistoryFromForm(form) {
    if (!form || typeof form !== 'object') {
        return;
    }

    pushRouteHistoryEntry('from', {
        ...(form.from_location || {}),
        lat: form.fromLat,
        lng: form.fromLng,
    });

    pushRouteHistoryEntry('to', {
        ...(form.to_location || {}),
        lat: form.toLat,
        lng: form.toLng,
    });
}

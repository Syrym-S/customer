import i18n from '../../../shared/i18n';
import { mapLeadFromApi } from '../../customer-leads/model/lead.adapter';
import { normalizeLocationValue } from '../../customer-leads/model/lead-edit-form.helpers';
import { formatLeadDate } from '../../customer-leads/model/lead.helpers';
import {
    formatScheduleDatePart,
    getPointScheduleByIndex,
} from '../../customer-leads/model/lead-route.helpers';
import { getShortLocationLabel } from '../../../shared/helpers/data-grid.helpers';

export const FORWARDER_LEADS_PER_PAGE = 10;

const EMPTY = '—';

function getPlaceholderValues() {
    return [
        i18n.t('common.empty.notSpecifiedN'),
        i18n.t('common.empty.notSpecifiedM'),
    ];
}

function toDisplayValue(value) {
    const text = String(value ?? '').trim();

    if (!text || getPlaceholderValues().includes(text)) {
        return EMPTY;
    }

    return text;
}

export function sortLeadsByCreatedAtDesc(leads) {
    if (!Array.isArray(leads)) {
        return [];
    }

    function toTimestamp(lead) {
        const raw = lead?.created_at;

        if (!raw) {
            return null;
        }

        const value = typeof raw === 'string' ? raw.replace(' ', 'T') : raw;
        const timestamp = new Date(value).getTime();

        return Number.isNaN(timestamp) ? null : timestamp;
    }

    return [...leads].sort((first, second) => {
        const firstTimestamp = toTimestamp(first);
        const secondTimestamp = toTimestamp(second);

        if (firstTimestamp === null && secondTimestamp === null) {
            return 0;
        }

        if (firstTimestamp === null) {
            return 1;
        }

        if (secondTimestamp === null) {
            return -1;
        }

        return secondTimestamp - firstTimestamp;
    });
}

export function mapForwarderLeads(forwarderLeads) {
    if (!Array.isArray(forwarderLeads)) {
        return [];
    }

    const mapped = forwarderLeads
        .filter(Boolean)
        .map((apiLead) => mapLeadFromApi(apiLead));

    return sortLeadsByCreatedAtDesc(mapped);
}

export function getForwarderLeadsPage(
    leads,
    page,
    perPage = FORWARDER_LEADS_PER_PAGE,
) {
    if (!Array.isArray(leads)) {
        return [];
    }

    const startIndex = (page - 1) * perPage;

    return leads.slice(startIndex, startIndex + perPage);
}

export function getForwarderLeadsPageCount(
    total,
    perPage = FORWARDER_LEADS_PER_PAGE,
) {
    return Math.max(1, Math.ceil(total / perPage));
}

function toPositiveNumber(value) {
    const number = Number(value);

    return Number.isFinite(number) && number > 0 ? number : null;
}

export function normalizeForwarderLeadsPagination(
    response,
    { requestedPage, requestedPerPage = FORWARDER_LEADS_PER_PAGE, itemsCount },
) {
    const page = toPositiveNumber(response?.page) ?? requestedPage;
    const serverPerPage = toPositiveNumber(response?.per_page);
    const total = toPositiveNumber(response?.count ?? response?.total);

    if (itemsCount > requestedPerPage) {
        return {
            page: requestedPage,
            perPage: requestedPerPage,
            total: total ?? itemsCount,
            pageCount: getForwarderLeadsPageCount(itemsCount, requestedPerPage),
            isClientPaginated: true,
        };
    }

    const perPage = Math.min(requestedPerPage, serverPerPage ?? requestedPerPage);

    if (total) {
        return {
            page,
            perPage,
            total,
            pageCount: getForwarderLeadsPageCount(total, perPage),
            isClientPaginated: false,
        };
    }

    const hasFullPage = itemsCount > 0 && itemsCount >= requestedPerPage;

    return {
        page,
        perPage,
        total: null,
        pageCount: Math.max(1, hasFullPage ? page + 1 : page),
        isClientPaginated: false,
    };
}

export function getForwarderLeadRoute(lead) {
    const fromFull = normalizeLocationValue(lead?.from_location);
    const toFull = normalizeLocationValue(lead?.to_location);

    return {
        fromLabel: toDisplayValue(getShortLocationLabel(lead?.from_location, fromFull)),
        toLabel: toDisplayValue(getShortLocationLabel(lead?.to_location, toFull)),
        fromTitle: toDisplayValue(fromFull),
        toTitle: toDisplayValue(toFull),
    };
}

export function getForwarderLeadDates(lead) {
    const pointSchedules = Array.isArray(lead?.point_schedules)
        ? lead.point_schedules
        : [];

    const waypointsCount = Array.isArray(lead?.waypoints)
        ? lead.waypoints.length
        : 0;

    const startSchedule = getPointScheduleByIndex(pointSchedules, 0);
    const endSchedule = getPointScheduleByIndex(
        pointSchedules,
        waypointsCount + 1,
    );

    const startLabel =
        formatScheduleDatePart(lead?.raw?.start_at) ||
        formatScheduleDatePart(startSchedule?.start_at) ||
        formatScheduleDatePart(startSchedule?.end_at);

    const endLabel =
        formatScheduleDatePart(lead?.raw?.end_at) ||
        formatScheduleDatePart(endSchedule?.end_at) ||
        formatScheduleDatePart(endSchedule?.start_at);

    return {
        createdAtLabel: lead?.created_at
            ? toDisplayValue(formatLeadDate(lead.created_at))
            : EMPTY,
        startAtLabel: startLabel || EMPTY,
        endAtLabel: endLabel || EMPTY,
    };
}

export function getForwarderLeadCargoLabel(lead) {
    const cargos = Array.isArray(lead?.cargos) ? lead.cargos : [];

    if (cargos.length === 0) {
        return EMPTY;
    }

    const names = cargos
        .map((cargo) => toDisplayValue(cargo?.name || cargo?.type))
        .filter((name) => name !== EMPTY);

    if (names.length === 0) {
        return EMPTY;
    }

    const totalWeight = cargos.reduce(
        (sum, cargo) =>
            typeof cargo?.weight_kg === 'number' ? sum + cargo.weight_kg : sum,
        0,
    );

    const namesLabel = names.join(', ');

    return totalWeight > 0
        ? i18n.t('common.units.cargoSummary', {
              cargoCount: namesLabel,
              weight: totalWeight,
          })
        : namesLabel;
}

export const FORWARDER_LEAD_EMPTY_VALUE = EMPTY;

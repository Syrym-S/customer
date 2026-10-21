export const MANUFACTURERS_PER_PAGE = 10;
export const MANUFACTURER_LEADS_PER_PAGE = 10;
export const LEADS_POOL_LIMIT = 100;

export const MANUFACTURER_LINK_FILTERS = {
   ALL: 'all',
   ATTACHED: 'attached',
   FREE: 'free',
};

export function normalizeManufacturer(manufacturer) {
   if (!manufacturer) {
      return null;
   }

   return {
      id: manufacturer.id ?? manufacturer._id ?? '',
      companyName: manufacturer.companyName ?? manufacturer.company_name ?? '',
      companyBin: manufacturer.companyBin ?? manufacturer.company_bin ?? '',
      linkedAt: manufacturer.linkedAt ?? manufacturer.linked_at ?? null,
   };
}

export function normalizeManufacturersResponse(response) {
   const items = Array.isArray(response?.items) ? response.items : [];

   return items.map(normalizeManufacturer).filter(Boolean);
}

export function getManufacturerId(manufacturer) {
   return manufacturer?.id || '';
}

export function getManufacturerName(manufacturer) {
   return manufacturer?.companyName || 'Название не указано';
}

export function getManufacturerBin(manufacturer) {
   return manufacturer?.companyBin || 'Не указан';
}

export function getManufacturerLinkedAt(manufacturer) {
   return manufacturer?.linkedAt ?? null;
}

export function getLeadManufacturerName(lead) {
   return lead?.manufacturer ? getManufacturerName(lead.manufacturer) : '';
}

export function hasAttachedManufacturer(lead) {
   return Boolean(lead?.manufacturer?.id);
}

export function countLeadsByManufacturer(leads) {
   const counts = new Map();

   leads.forEach((lead) => {
      const manufacturerId = lead?.manufacturer?.id;

      if (!manufacturerId) {
         return;
      }

      counts.set(manufacturerId, (counts.get(manufacturerId) ?? 0) + 1);
   });

   return counts;
}

export function filterLeadsByManufacturer(leads, { manufacturerId, linkState }) {
   return leads.filter((lead) => {
      if (manufacturerId && lead.manufacturer?.id !== manufacturerId) {
         return false;
      }

      if (
         linkState === MANUFACTURER_LINK_FILTERS.ATTACHED &&
         !hasAttachedManufacturer(lead)
      ) {
         return false;
      }

      if (
         linkState === MANUFACTURER_LINK_FILTERS.FREE &&
         hasAttachedManufacturer(lead)
      ) {
         return false;
      }

      return true;
   });
}

function getLeadLocationText(location) {
   if (!location) {
      return '';
   }

   if (typeof location === 'string') {
      return location;
   }

   return location.address || location.name || location.title || '';
}

export function searchLeads(leads, search) {
   const normalizedSearch = String(search ?? '').trim().toLowerCase();

   if (!normalizedSearch) {
      return leads;
   }

   return leads.filter((lead) =>
      [
         `${lead.num ?? ''}`,
         getLeadLocationText(lead.from_location),
         getLeadLocationText(lead.to_location),
         getLeadManufacturerName(lead),
      ]
         .filter(Boolean)
         .some((field) => field.toLowerCase().includes(normalizedSearch)),
   );
}

export function paginate(items, page, perPage) {
   const startIndex = (page - 1) * perPage;

   return items.slice(startIndex, startIndex + perPage);
}

export const MANUFACTURER_REQUEST_DIRECTIONS = {
   INCOMING: 'incoming',
   OUTGOING: 'outgoing',
};

export const MANUFACTURER_ROW_STATUSES = {
   LINKED: 'linked',
   INCOMING: 'incoming',
   OUTGOING: 'outgoing',
};

export const ALL_ROW_STATUSES_VALUE = 'all';

const MANUFACTURER_ROW_STATUS_META = {
   [MANUFACTURER_ROW_STATUSES.LINKED]: { label: 'Привязан', color: 'success' },
   [MANUFACTURER_ROW_STATUSES.INCOMING]: {
      label: 'Входящая заявка',
      color: 'warning',
   },
   [MANUFACTURER_ROW_STATUSES.OUTGOING]: {
      label: 'Заявка отправлена',
      color: 'info',
   },
};

export function getManufacturerRowStatusOptions() {
   return Object.values(MANUFACTURER_ROW_STATUSES).map((status) => ({
      value: status,
      label: MANUFACTURER_ROW_STATUS_META[status].label,
   }));
}

export function getManufacturerRowStatusLabel(status) {
   return MANUFACTURER_ROW_STATUS_META[status]?.label || 'Неизвестно';
}

export function getManufacturerRowStatusColor(status) {
   return MANUFACTURER_ROW_STATUS_META[status]?.color || 'default';
}

export function normalizeManufacturerRequest(request) {
   const manufacturer = normalizeManufacturer(request);

   if (!manufacturer?.id) {
      return null;
   }

   return {
      ...manufacturer,
      direction:
         request?.direction === MANUFACTURER_REQUEST_DIRECTIONS.OUTGOING
            ? MANUFACTURER_REQUEST_DIRECTIONS.OUTGOING
            : MANUFACTURER_REQUEST_DIRECTIONS.INCOMING,
   };
}

export function normalizeManufacturerRequestsResponse(response) {
   const items = Array.isArray(response?.items) ? response.items : [];

   return items.map(normalizeManufacturerRequest).filter(Boolean);
}

export function buildManufacturerRows(manufacturers, requests) {
   const rows = manufacturers.map((manufacturer) => ({
      ...manufacturer,
      rowStatus: MANUFACTURER_ROW_STATUSES.LINKED,
   }));

   const knownIds = new Set(rows.map(getManufacturerId));

   requests.forEach((request) => {
      if (knownIds.has(request.id)) {
         return;
      }

      knownIds.add(request.id);

      rows.push({
         ...request,
         rowStatus:
            request.direction === MANUFACTURER_REQUEST_DIRECTIONS.OUTGOING
               ? MANUFACTURER_ROW_STATUSES.OUTGOING
               : MANUFACTURER_ROW_STATUSES.INCOMING,
      });
   });

   return rows;
}

export function getManufacturerRowStatus(row) {
   return row?.rowStatus || MANUFACTURER_ROW_STATUSES.LINKED;
}

export function filterManufacturerRowsByStatus(rows, status) {
   if (!status || status === ALL_ROW_STATUSES_VALUE) {
      return rows;
   }

   return rows.filter((row) => getManufacturerRowStatus(row) === status);
}

export function getRowIdsByStatus(rows, ids, statuses) {
   const allowed = new Set(statuses);

   return ids.filter((rowId) => {
      const row = rows.find((item) => getManufacturerId(item) === rowId);

      return Boolean(row) && allowed.has(getManufacturerRowStatus(row));
   });
}

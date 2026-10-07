import { mockLeads } from '../model/leads.mock';
import { findTnvedByCodeMock } from '../../customer-tnved/api/tnved.mock-api';
import { getCurrentUserId } from '../../../shared/helpers/current-user.helpers';

function isOwnDraft(lead, currentUserId) {
   return lead.is_draft === true && lead.createdBy === currentUserId;
}

function isVisibleInDefaultList(lead, currentUserId) {
   return lead.is_draft !== true || lead.createdBy === currentUserId;
}

export async function fetchCustomerLeadsMock({
   page = 1,
   perPage = 4,
   status,
   search,
   isDraft,
} = {}) {
   const currentUserId = getCurrentUserId();

   let filteredLeads = isDraft
      ? mockLeads.filter((lead) => isOwnDraft(lead, currentUserId))
      : mockLeads.filter((lead) => isVisibleInDefaultList(lead, currentUserId));

   if (status) {
      filteredLeads = filteredLeads.filter((lead) => lead.status === status);
   }

   const normalizedSearch = String(search ?? '').trim().toLowerCase();

   if (normalizedSearch) {
      filteredLeads = filteredLeads.filter((lead) =>
         [lead.from_location, lead.to_location]
            .filter(Boolean)
            .some((location) =>
               location.toLowerCase().includes(normalizedSearch),
            ),
      );
   }

   const startIndex = (page - 1) * perPage;
   const endIndex = startIndex + perPage;

   return {
      results: filteredLeads.slice(startIndex, endIndex),
      page,
      per_page: perPage,
      count: filteredLeads.length,
   };
}

export async function fetchCustomerLeadByIdMock(leadId) {
   const currentUserId = getCurrentUserId();
   const lead = mockLeads.find((item) => item.id === leadId);

   if (lead?.is_draft === true && lead.createdBy !== currentUserId) {
      return { data: null };
   }

   return {
      data: lead ?? null,
   };
}

const ROUTE_LOCATION_FIELDS = ['country', 'region', 'city', 'address'];

function applyRouteLocationUpdate(lead, prefix, payload) {
   const hasFieldUpdate = ROUTE_LOCATION_FIELDS.some(
      (field) => payload[`${prefix}_${field}`] !== undefined,
   );
   const hasLat = payload[`${prefix}_lat`] !== undefined;
   const hasLon = payload[`${prefix}_lon`] !== undefined;

   if (!hasFieldUpdate && !hasLat && !hasLon) {
      return;
   }

   const locationField = `${prefix}_location`;
   const existingLocation =
      lead[locationField] && typeof lead[locationField] === 'object'
         ? lead[locationField]
         : {};

   const nextLocation = { ...existingLocation };

   ROUTE_LOCATION_FIELDS.forEach((field) => {
      const payloadKey = `${prefix}_${field}`;

      if (payload[payloadKey] !== undefined) {
         nextLocation[field] = payload[payloadKey];
      }
   });

   if (hasLat) {
      nextLocation.lat = payload[`${prefix}_lat`];
   }

   if (hasLon) {
      nextLocation.lon = payload[`${prefix}_lon`];
   }

   lead[locationField] = nextLocation;
}

function resolveMockCargoTnved(code, previousCargos) {
   const previousTnved = previousCargos.find(
      (cargo) => cargo?.tnved?.code === code,
   )?.tnved;

   return findTnvedByCodeMock(code) ?? previousTnved ?? { code, name: '' };
}

export function mapMockCargosTnved(cargos, previousCargos = []) {
   if (!Array.isArray(cargos)) {
      return cargos;
   }

   return cargos.map(({ tnved_code: tnvedCode, ...cargo }) => ({
      ...cargo,
      tnved: tnvedCode ? resolveMockCargoTnved(tnvedCode, previousCargos) : null,
   }));
}

export async function updateCustomerLeadMock(leadId, payload = {}) {
   const lead = mockLeads.find((item) => item.id === leadId);

   if (!lead) {
      return { message: 'Lead updated successfully' };
   }

   applyRouteLocationUpdate(lead, 'from', payload);
   applyRouteLocationUpdate(lead, 'to', payload);

   const rest = { ...payload };

   ['from', 'to'].forEach((prefix) => {
      [...ROUTE_LOCATION_FIELDS, 'lat', 'lon'].forEach((field) => {
         delete rest[`${prefix}_${field}`];
      });
   });

   if (Array.isArray(rest.cargos)) {
      rest.cargos = mapMockCargosTnved(rest.cargos, lead.cargos ?? []);
   }

   Object.assign(lead, rest);

   return { message: 'Lead updated successfully' };
}

export async function publishLeadMock(leadId) {
   const lead = mockLeads.find((item) => item.id === leadId);

   if (!lead) {
      throw new Error('Заказ не найден');
   }

   lead.is_draft = false;
   lead.created_at = new Date().toISOString();

   return { message: 'Lead published' };
}

export async function deleteLeadMock(leadId) {
   const index = mockLeads.findIndex((item) => item.id === leadId);

   if (index !== -1) {
      mockLeads.splice(index, 1);
   }

   return { message: 'Lead deleted' };
}

export async function exportLeadsReportMock() {
   const csv = 'num,status,from_location,to_location,price\n';

   return {
      blob: new Blob([csv], { type: 'text/csv' }),
      contentDisposition: null,
   };
}

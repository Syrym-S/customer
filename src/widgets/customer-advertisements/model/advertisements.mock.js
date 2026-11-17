import { mockLeads } from '../../customer-leads/model/leads.mock';

const ADVERTISEMENT_LEADS_COUNT = 26;
const ADVERTISEMENTS_COUNT = 14;

function pad(value) {
   return String(value).padStart(2, '0');
}

function buildDateTime(dayOffset, hour) {
   const date = new Date();

   date.setDate(date.getDate() + dayOffset);

   return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate(),
   )} ${pad(hour)}:00:00`;
}

function buildContacts(index) {
   return {
      phone: `+7 70${(index % 8) + 1} ${100 + index} ${20 + index} ${
         (index % 9) + 10
      }`,
      email: `manager${index + 1}@360logistics.kz`,
   };
}

function buildPointSchedules(index) {
   const startDay = (index % 12) + 1;
   const startHour = 8 + (index % 10);

   return [
      {
         point_index: 0,
         start_at: buildDateTime(startDay, startHour),
         end_at: buildDateTime(startDay, startHour + 3),
      },
      {
         point_index: 1,
         start_at: buildDateTime(startDay + 2, 9),
         end_at: buildDateTime(startDay + 2, 18),
      },
   ];
}

function buildMockAdvertisementLead(lead, index) {
   return {
      ...lead,
      status: 'new',
      price: lead.summ || null,
      currency: lead.currency || 'KZT',
      point_schedules: buildPointSchedules(index),
      contacts: buildContacts(index),
   };
}

export const mockAdvertisementLeads = mockLeads
   .filter((lead) => !lead.is_draft)
   .slice(0, ADVERTISEMENT_LEADS_COUNT)
   .map(buildMockAdvertisementLead);

export const mockAdvertisements = mockAdvertisementLeads
   .slice(0, ADVERTISEMENTS_COUNT)
   .map((lead, index) => ({
      id: `mock-advertisement-${index + 1}`,
      type_source: 'customer',
      expired_at: lead.point_schedules[0].start_at,
      closed_at: index % 4 === 3 ? buildDateTime(-index, 18) : null,
      created_at: buildDateTime(-(index + 1), 9 + (index % 8)),
      lead,
   }));

export function buildMockAdvertisementFromLead(lead) {
   const firstSchedule = Array.isArray(lead?.point_schedules)
      ? lead.point_schedules[0]
      : null;

   return {
      id: `mock-advertisement-${Date.now()}`,
      type_source: 'customer',
      expired_at: firstSchedule?.start_at || '',
      closed_at: null,
      created_at: buildDateTime(0, new Date().getHours()),
      lead,
   };
}

export function addMockAdvertisement(advertisement) {
   mockAdvertisements.unshift(advertisement);

   return advertisement;
}

export function closeMockAdvertisement(advertisementId) {
   const advertisement = mockAdvertisements.find(
      (item) => item.id === advertisementId,
   );

   if (!advertisement) {
      return null;
   }

   advertisement.closed_at = buildDateTime(0, new Date().getHours());

   return advertisement;
}

export function removeMockAdvertisement(advertisementId) {
   const index = mockAdvertisements.findIndex(
      (item) => item.id === advertisementId,
   );

   if (index >= 0) {
      mockAdvertisements.splice(index, 1);
   }

   return { success: true };
}

export function addMockAdvertisementLead(lead) {
   mockAdvertisementLeads.unshift(lead);

   return lead;
}

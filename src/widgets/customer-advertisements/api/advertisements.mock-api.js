import {
   addMockAdvertisement,
   addMockAdvertisementLead,
   buildMockAdvertisementFromLead,
   closeMockAdvertisement,
   mockAdvertisementLeads,
   mockAdvertisements,
   removeMockAdvertisement,
   updateMockAdvertisementLead,
} from '../model/advertisements.mock';

const MOCK_DELAY_MS = 350;

function delay(ms = MOCK_DELAY_MS) {
   return new Promise((resolve) => {
      setTimeout(resolve, ms);
   });
}

function getAdvertisedLeadIds() {
   return new Set(
      mockAdvertisements
         .map((advertisement) => advertisement.lead?.id)
         .filter(Boolean),
   );
}

function matchesNum(lead, num) {
   if (!num) {
      return true;
   }

   return String(lead?.num ?? '').includes(num);
}

function matchesQuery(lead, query) {
   if (!query) {
      return true;
   }

   return [lead?.from_location, lead?.to_location, lead?.cargos?.[0]?.name]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
}

export async function fetchAdvertisementsMock({ page = 1, perPage = 10 } = {}) {
   await delay();

   const start = (page - 1) * perPage;

   return {
      results: mockAdvertisements.slice(start, start + perPage),
      page,
      per_page: perPage,
      count: mockAdvertisements.length,
   };
}

export async function fetchAdvertisementMock(advertisementId) {
   await delay(200);

   const advertisement = mockAdvertisements.find(
      (item) => item.id === advertisementId,
   );

   if (!advertisement) {
      throw new Error('Advertisement not found');
   }

   return advertisement;
}

export async function searchAdvertisementLeadsMock({
   q = '',
   num = '',
   perPage = 20,
} = {}) {
   await delay(250);

   const query = String(q ?? '')
      .trim()
      .toLowerCase();
   const normalizedNum = String(num ?? '').trim();

   const advertisedLeadIds = getAdvertisedLeadIds();

   return mockAdvertisementLeads
      .filter((lead) => !advertisedLeadIds.has(lead.id))
      .filter((lead) => matchesNum(lead, normalizedNum))
      .filter((lead) => matchesQuery(lead, query))
      .slice(0, perPage);
}

export async function closeAdvertisementMock(advertisementId) {
   await delay();

   const advertisement = closeMockAdvertisement(advertisementId);

   if (!advertisement) {
      throw new Error('Advertisement not found');
   }

   return advertisement;
}

export async function updateAdvertisementMock({ advertisementId, leadId }) {
   await delay();

   const advertisement = updateMockAdvertisementLead(advertisementId, leadId);

   if (!advertisement) {
      throw new Error('Advertisement not found');
   }

   return advertisement;
}

export async function deleteAdvertisementMock(advertisementId) {
   await delay();

   return removeMockAdvertisement(advertisementId);
}

export async function createAdvertisementMock({ leadId, lead }) {
   await delay();

   const knownLead = mockAdvertisementLeads.find((item) => item.id === leadId);

   if (!knownLead && lead) {
      addMockAdvertisementLead(lead);
   }

   return addMockAdvertisement(
      buildMockAdvertisementFromLead(knownLead || lead),
   );
}

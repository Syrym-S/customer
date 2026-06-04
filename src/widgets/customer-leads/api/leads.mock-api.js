import { mockLeads } from '../model/leads.mock';

export async function fetchCustomerLeadsMock({ page = 1, perPage = 4 } = {}) {
   const startIndex = (page - 1) * perPage;
   const endIndex = startIndex + perPage;

   return {
      results: mockLeads.slice(startIndex, endIndex),
      page,
      per_page: perPage,
      count: mockLeads.length,
   };
}

export async function fetchCustomerLeadByIdMock(leadId) {
   const lead = mockLeads.find((item) => item.id === leadId);

   return {
      data: lead ?? null,
   };
}

import { mockLeads } from '../model/leads.mock';

export async function fetchCustomerLeadsMock({ page = 1, perPage = 4, status } = {}) {
   const filteredLeads = status
      ? mockLeads.filter((lead) => lead.status === status)
      : mockLeads;

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
   const lead = mockLeads.find((item) => item.id === leadId);

   return {
      data: lead ?? null,
   };
}

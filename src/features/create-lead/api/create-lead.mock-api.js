import { mockLeads } from '../../../widgets/customer-leads/model/leads.mock';
import { getCurrentUserId } from '../../../shared/helpers/current-user.helpers';

export async function createLeadMock(payload = {}) {
   const isDraft = Boolean(payload.is_draft);
   const currentUserId = getCurrentUserId();

   const createdLead = {
      ...payload,
      id: `mock-lead-${Date.now()}`,
      status: payload.status || 'new',
      is_draft: isDraft,
      created_at: isDraft ? null : new Date().toISOString(),
      createdBy: currentUserId,
   };

   mockLeads.unshift(createdLead);

   return createdLead;
}

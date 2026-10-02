import { mockComplaints } from '../model/complaints.mock';
import { isWithinLastDays } from '../model/complaints.helpers';
import { getCurrentUserId } from '../../../shared/helpers/current-user.helpers';

// This is a single-customer mock app context (no window.APP_DATA user_id
// in local/demo environments), so fall back to a constant id rather than
// leaving every seeded complaint's creator_id as null — mirrors the same
// getCurrentUserId() + fallback pattern leads.mock-api.js's
// isOwnDraft/isVisibleInDefaultList rely on, just needed earlier here
// since complaints are entirely owned by the current user.
const FALLBACK_CURRENT_USER_ID = 'mock-current-customer';

function resolveCurrentUserId() {
   return getCurrentUserId() ?? FALLBACK_CURRENT_USER_ID;
}

mockComplaints.forEach((complaint) => {
   if (!complaint.creator_id) {
      complaint.creator_id = resolveCurrentUserId();
   }
});

export async function fetchComplaintsMock({ page = 1, perPage = 10 } = {}) {
   const currentUserId = resolveCurrentUserId();

   const ownComplaints = mockComplaints.filter(
      (complaint) => complaint.creator_id === currentUserId,
   );

   const withinWindow = ownComplaints.filter((complaint) =>
      isWithinLastDays(complaint.created_at),
   );

   const sorted = [...withinWindow].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
   );

   const startIndex = (page - 1) * perPage;
   const endIndex = startIndex + perPage;

   return {
      results: sorted.slice(startIndex, endIndex),
      page,
      per_page: perPage,
      count: sorted.length,
   };
}

export async function fetchComplaintByIdMock(complaintId) {
   const complaint = mockComplaints.find((item) => item.id === complaintId);

   return { data: complaint ?? null };
}

export async function createComplaintMock(payload = {}) {
   const now = new Date().toISOString();

   const complaint = {
      id: `mock-complaint-${mockComplaints.length + 1}`,
      final_status: null,
      request: payload.request ?? '',
      response: null,
      files: Array.isArray(payload.files) ? payload.files : [],
      created_at: now,
      updated_at: now,
      acceptance_at: null,
      finaled_at: null,
      creator_id: resolveCurrentUserId(),
      target: payload.target ?? null,
   };

   mockComplaints.unshift(complaint);

   return { data: complaint };
}

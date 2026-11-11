import { apiClient } from '../../../shared/api/api-client';

export const LEAD_POLYLINES_BATCH_LIMIT = 50;

export const leadPolylineStatuses = {
   OK: 'ok',
   NO_TRACKING: 'no_tracking',
   FORBIDDEN: 'forbidden',
   NOT_FOUND: 'not_found',
};

function getPolylineItems(data) {
   if (Array.isArray(data)) {
      return data;
   }

   if (Array.isArray(data?.data)) {
      return data.data;
   }

   if (Array.isArray(data?.polylines)) {
      return data.polylines;
   }

   return [];
}

export async function fetchLeadPolylinesApi(leadIds, { signal } = {}) {
   const response = await apiClient.post(
      '/geows/v1/polylines',
      {
         lead_ids: leadIds,
      },
      {
         signal,
      },
   );

   return getPolylineItems(response.data);
}

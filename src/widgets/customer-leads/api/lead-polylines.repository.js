import { isMockApi } from '../../../shared/config/api.config';
import { getLeadId } from '../model/lead.helpers';
import {
   LEAD_POLYLINES_BATCH_LIMIT,
   fetchLeadPolylinesApi,
} from './lead-polylines.api';
import { fetchLeadPolylinesMock } from './lead-polylines.mock';

function chunkLeadIds(leadIds, chunkSize) {
   const chunks = [];

   for (let index = 0; index < leadIds.length; index += chunkSize) {
      chunks.push(leadIds.slice(index, index + chunkSize));
   }

   return chunks;
}

export async function fetchLeadPolylines(leads, { signal } = {}) {
   const leadsWithId = (leads || []).filter((lead) => Boolean(getLeadId(lead)));

   if (!leadsWithId.length) {
      return [];
   }

   if (isMockApi) {
      return fetchLeadPolylinesMock(leadsWithId);
   }

   const leadIds = leadsWithId.map((lead) => String(getLeadId(lead)));

   const responses = await Promise.all(
      chunkLeadIds(leadIds, LEAD_POLYLINES_BATCH_LIMIT).map((chunk) =>
         fetchLeadPolylinesApi(chunk, { signal }),
      ),
   );

   return responses.flat();
}

import { isMockApi } from '../../../shared/config/api.config';
import { fetchLeadParamsApi, normalizeLeadParamsResponse } from './lead-params.api';
import { fetchLeadParamsMock } from './lead-params.mock-api';

export async function fetchLeadParams() {
   const rawResponse = isMockApi
      ? await fetchLeadParamsMock()
      : await fetchLeadParamsApi();

   return normalizeLeadParamsResponse(rawResponse);
}

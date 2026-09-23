import { isMockApi } from '../../../shared/config/api.config';
import { fetchCustomerStatsApi } from './stats.api';
import { fetchCustomerStatsMock } from './stats.mock';
import { buildStatsQueryParams } from './stats.params';

export function fetchCustomerStats(periods) {
   const params = buildStatsQueryParams(periods);

   if (isMockApi) {
      return fetchCustomerStatsMock(params);
   }

   return fetchCustomerStatsApi(params);
}

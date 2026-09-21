import { isMockApi } from '../../../shared/config/api.config';
import { fetchCustomerStatsApi } from './stats.api';
import { fetchCustomerStatsMock } from './stats.mock';

export function fetchCustomerStats(params) {
   if (isMockApi) {
      return fetchCustomerStatsMock(params);
   }

   return fetchCustomerStatsApi(params);
}

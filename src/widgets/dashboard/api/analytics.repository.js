import { isMockApi } from '../../../shared/config/api.config';
import { fetchLeadsAnalyticsApi } from './analytics.api';
import { fetchLeadsAnalyticsMock } from './analytics.mock';

export function fetchLeadsAnalytics(params) {
   if (isMockApi) {
      return fetchLeadsAnalyticsMock(params);
   }

   return fetchLeadsAnalyticsApi(params);
}

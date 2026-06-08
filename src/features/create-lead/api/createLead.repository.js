import { isMockApi } from '../../../shared/config/api.config';
import { createLeadApi } from './createLead.api';
import { createLeadMock } from './createLead.mock-api';

export function createLead(payload) {
   if (isMockApi) {
      return createLeadMock(payload);
   }

   return createLeadApi(payload);
}

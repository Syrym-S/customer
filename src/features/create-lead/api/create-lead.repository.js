import { isMockApi } from '../../../shared/config/api.config';
import { createLeadApi } from './create-lead.api';
import { createLeadMock } from './create-lead.mock-api';

export function createLead(payload) {
   if (isMockApi) {
      return createLeadMock(payload);
   }

   return createLeadApi(payload);
}

import { API_MODE, isMockApi } from '../../../shared/config/api.config';
import { fetchCustomerLeadByIdApi, fetchCustomerLeadsApi } from './leads.api';
import {
   fetchCustomerLeadByIdMock,
   fetchCustomerLeadsMock,
} from './leads.mock-api';

export function fetchCustomerLeads(params) {
   if (isMockApi) {
      return fetchCustomerLeadsMock(params);
   }

   return fetchCustomerLeadsApi(params);
}

export function fetchCustomerLeadById(leadId) {
   console.log('fetch lead item:', leadId, 'mode:', API_MODE);

   if (isMockApi) {
      return fetchCustomerLeadByIdMock(leadId);
   }

   return fetchCustomerLeadByIdApi(leadId);
}

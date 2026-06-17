import { apiClient } from '../../../shared/api/api-client';
import { isMockApi } from '../../../shared/config/api.config';
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
   if (isMockApi) {
      return fetchCustomerLeadByIdMock(leadId);
   }

   return fetchCustomerLeadByIdApi(leadId);
}

export async function updateCustomerLeadApi(leadId, payload) {
   const response = await apiClient.post(
      `/customer/v1/leads/${leadId}/update`,
      payload,
   );

   return response.data;
}

export async function updateCustomerLead(leadId, payload) {
   if (isMockApi) {
      return {
         message: 'Lead updated',
         data: {
            id: leadId,
            ...payload,
         },
      };
   }

   return updateCustomerLeadApi(leadId, payload);
}

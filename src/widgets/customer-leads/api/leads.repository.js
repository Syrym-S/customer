import { apiClient } from '../../../shared/api/api-client';
import { isMockApi } from '../../../shared/config/api.config';
import {
   deleteLeadApi,
   exportLeadsReportApi,
   fetchCustomerLeadByIdApi,
   fetchCustomerLeadsApi,
   publishLeadApi,
} from './leads.api';
import {
   deleteLeadMock,
   exportLeadsReportMock,
   fetchCustomerLeadByIdMock,
   fetchCustomerLeadsMock,
   publishLeadMock,
   updateCustomerLeadMock,
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

export function updateCustomerLead(leadId, payload) {
   if (isMockApi) {
      return updateCustomerLeadMock(leadId, payload);
   }

   return updateCustomerLeadApi(leadId, payload);
}

export function publishLead(leadId) {
   if (isMockApi) {
      return publishLeadMock(leadId);
   }

   return publishLeadApi(leadId);
}

export function deleteLead(leadId) {
   if (isMockApi) {
      return deleteLeadMock(leadId);
   }

   return deleteLeadApi(leadId);
}

export function exportLeadsReport(params) {
   if (isMockApi) {
      return exportLeadsReportMock(params);
   }

   return exportLeadsReportApi(params);
}

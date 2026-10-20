import { isMockApi } from '../../../shared/config/api.config';
import { normalizeManufacturer } from '../model/manufacturers.helpers';
import {
   attachManufacturerApi,
   attachManufacturerToLeadApi,
   detachManufacturerApi,
   detachManufacturerFromLeadApi,
   fetchMyManufacturersApi,
   searchManufacturersApi,
} from './manufacturers.api';
import {
   attachManufacturerMock,
   attachManufacturerToLeadMock,
   detachManufacturerFromLeadMock,
   detachManufacturerMock,
   fetchMyManufacturersMock,
   getMockLeadManufacturer,
   searchManufacturersMock,
} from './manufacturers.mock-api';

export function searchManufacturers(query) {
   if (isMockApi) {
      return searchManufacturersMock(query);
   }

   return searchManufacturersApi(query);
}

export function fetchMyManufacturers() {
   if (isMockApi) {
      return fetchMyManufacturersMock();
   }

   return fetchMyManufacturersApi();
}

export function attachManufacturer(manufacturerId) {
   if (isMockApi) {
      return attachManufacturerMock(manufacturerId);
   }

   return attachManufacturerApi(manufacturerId);
}

export function detachManufacturer(manufacturerId) {
   if (isMockApi) {
      return detachManufacturerMock(manufacturerId);
   }

   return detachManufacturerApi(manufacturerId);
}

export function attachManufacturerToLead(leadId, manufacturerId) {
   if (isMockApi) {
      return attachManufacturerToLeadMock(leadId, manufacturerId);
   }

   return attachManufacturerToLeadApi(leadId, manufacturerId);
}

export function detachManufacturerFromLead(leadId) {
   if (isMockApi) {
      return detachManufacturerFromLeadMock(leadId);
   }

   return detachManufacturerFromLeadApi(leadId);
}

export function withLeadManufacturers(leads) {
   if (isMockApi) {
      return leads.map((lead) => ({
         ...lead,
         manufacturer: normalizeManufacturer(getMockLeadManufacturer(lead.id)),
      }));
   }

   return leads.map((lead) => ({
      ...lead,
      manufacturer: normalizeManufacturer(lead.raw?.manufacturer),
   }));
}

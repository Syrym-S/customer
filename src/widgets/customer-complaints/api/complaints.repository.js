import { isMockApi } from '../../../shared/config/api.config';
import {
   createComplaintApi,
   fetchComplaintByIdApi,
   fetchComplaintsApi,
} from './complaints.api';
import {
   createComplaintMock,
   fetchComplaintByIdMock,
   fetchComplaintsMock,
} from './complaints.mock-api';

export function fetchComplaints(params) {
   if (isMockApi) {
      return fetchComplaintsMock(params);
   }

   return fetchComplaintsApi(params);
}

export function fetchComplaintById(complaintId) {
   if (isMockApi) {
      return fetchComplaintByIdMock(complaintId);
   }

   return fetchComplaintByIdApi(complaintId);
}

export function createComplaint(payload) {
   if (isMockApi) {
      return createComplaintMock(payload);
   }

   return createComplaintApi(payload);
}

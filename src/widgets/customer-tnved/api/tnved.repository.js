import { isMockApi } from '../../../shared/config/api.config';
import {
   fetchTnvedTreeApi,
   searchTnvedApi,
   searchTnvedCodesApi,
} from './tnved.api';
import {
   fetchTnvedTreeMock,
   searchTnvedCodesMock,
   searchTnvedMock,
} from './tnved.mock-api';

export function fetchTnvedTree() {
   if (isMockApi) {
      return fetchTnvedTreeMock();
   }

   return fetchTnvedTreeApi();
}

export function searchTnved(query) {
   if (isMockApi) {
      return searchTnvedMock(query);
   }

   return searchTnvedApi(query);
}

export function searchTnvedCodes(query) {
   if (isMockApi) {
      return searchTnvedCodesMock(query);
   }

   return searchTnvedCodesApi(query);
}

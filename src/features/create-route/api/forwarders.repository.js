import { isMockApi } from '../../../shared/config/api.config';
import { searchForwardersApi } from './forwarders.api';
import { searchForwardersMock } from './forwarders.mock-api';

export function searchForwarders(query) {
   if (isMockApi) {
      return searchForwardersMock(query);
   }

   return searchForwardersApi(query);
}

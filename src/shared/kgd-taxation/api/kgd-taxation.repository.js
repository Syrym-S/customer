import { isMockApi } from '../../config/api.config';
import { fetchTaxationRegimeApi } from './kgd-taxation.api';
import { fetchTaxationRegimeMock } from './kgd-taxation.mock-api';

export function fetchTaxationRegime(role, entityId) {
   if (isMockApi) {
      return fetchTaxationRegimeMock(role, entityId);
   }

   return fetchTaxationRegimeApi(role, entityId);
}

import { getTaxationRegimeMock } from '../model/kgd-taxation.mock';

export async function fetchTaxationRegimeMock(role, entityId) {
   if (!entityId) {
      return { data: null };
   }

   return { data: getTaxationRegimeMock(role, entityId) };
}

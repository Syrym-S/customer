import { isMockApi } from '../../../shared/config/api.config';
import { fetchTnvedCatalogApi, searchTnvedCodesApi } from './tnved.api';
import { fetchTnvedCatalogMock, searchTnvedCodesMock } from './tnved.mock-api';
import { normalizeTnvedCatalogResponse } from '../model/tnved.normalize';

export async function fetchTnvedCatalog({ q, page = 1, perPage = 100 } = {}) {
   if (isMockApi) {
      return fetchTnvedCatalogMock({ q, page, perPage });
   }

   const response = await fetchTnvedCatalogApi({ q, page, per_page: perPage });

   return normalizeTnvedCatalogResponse(response);
}

export async function searchTnvedCodes(q, limit = 10) {
   if (isMockApi) {
      return searchTnvedCodesMock(q, limit);
   }

   const response = await searchTnvedCodesApi(q, limit);

   return Array.isArray(response?.results) ? response.results : [];
}

import { isMockApi } from '../../../shared/config/api.config';
import {
   mapAdvertisementFromApi,
   mapAdvertisementLeadFromApi,
   mapAdvertisementsResponseFromApi,
} from '../model/advertisement.adapter';
import {
   createAdvertisementApi,
   fetchAdvertisementApi,
   fetchAdvertisementsApi,
   searchAdvertisementLeadsApi,
} from './advertisements.api';
import {
   createAdvertisementMock,
   fetchAdvertisementMock,
   fetchAdvertisementsMock,
   searchAdvertisementLeadsMock,
} from './advertisements.mock-api';

export async function fetchAdvertisements({ page = 1, perPage = 10 } = {}) {
   const data = isMockApi
      ? await fetchAdvertisementsMock({ page, perPage })
      : await fetchAdvertisementsApi({ page, perPage });

   return mapAdvertisementsResponseFromApi(data, { page, perPage });
}

export async function fetchAdvertisement(advertisementId) {
   const data = isMockApi
      ? await fetchAdvertisementMock(advertisementId)
      : await fetchAdvertisementApi(advertisementId);

   return mapAdvertisementFromApi(data);
}

export async function searchAdvertisementLeads({ q = '', perPage = 20 } = {}) {
   const data = isMockApi
      ? await searchAdvertisementLeadsMock({ q, perPage })
      : await searchAdvertisementLeadsApi({ q, perPage });

   return data.map(mapAdvertisementLeadFromApi).filter(Boolean);
}

export async function createAdvertisement({ leadId, lead }) {
   const data = isMockApi
      ? await createAdvertisementMock({ leadId, lead: lead?.raw || lead })
      : await createAdvertisementApi(leadId);

   return mapAdvertisementFromApi(data);
}

import { apiClient } from '../../../shared/api/api-client';

const advertisementsEndpoints = {
   create: '/customer/v1/advertisement/create',
   my: '/customer/v1/advertisements/my',
   myOne: '/customer/v1/advertisement/my',
   leadsSearch: '/customer/v1/advertisements/leads/search',
};

export async function fetchAdvertisementsApi({ page = 1, perPage = 10 } = {}) {
   const response = await apiClient.get(advertisementsEndpoints.my, {
      params: {
         page,
         per_page: perPage,
      },
   });

   return response.data;
}

export async function fetchAdvertisementApi(advertisementId) {
   const response = await apiClient.get(
      `${advertisementsEndpoints.myOne}/${advertisementId}`,
   );

   return response.data;
}

export async function searchAdvertisementLeadsApi({
   q = '',
   page = 1,
   perPage = 20,
} = {}) {
   const params = {
      page,
      per_page: perPage,
   };

   const normalizedQuery = String(q ?? '').trim();

   if (normalizedQuery) {
      params.q = normalizedQuery;
   }

   const response = await apiClient.get(advertisementsEndpoints.leadsSearch, {
      params,
   });

   const data = response.data;

   if (Array.isArray(data)) {
      return data;
   }

   return Array.isArray(data?.results) ? data.results : [];
}

export async function closeAdvertisementApi(advertisementId) {
   const response = await apiClient.post(
      `${advertisementsEndpoints.myOne}/${advertisementId}/close`,
   );

   return response.data;
}

export async function deleteAdvertisementApi(advertisementId) {
   const response = await apiClient.post(
      `${advertisementsEndpoints.myOne}/${advertisementId}/delete`,
   );

   return response.data;
}

export async function createAdvertisementApi(leadId) {
   const response = await apiClient.post(advertisementsEndpoints.create, {
      lead_id: leadId,
   });

   return response.data;
}

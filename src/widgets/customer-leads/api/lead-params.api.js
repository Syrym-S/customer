import { apiClient } from '../../../shared/api/api-client';
import { leadTransportationFields } from '../model/lead-transportation.helpers';

function normalizeLeadParamOption(item) {
   if (!item) {
      return null;
   }

   const name = item.name ?? item.label ?? item.value;

   if (!name) {
      return null;
   }

   return { value: name, label: name };
}

function normalizeLeadParamList(list) {
   return Array.isArray(list)
      ? list.map(normalizeLeadParamOption).filter(Boolean)
      : [];
}

export function normalizeLeadParamsResponse(response) {
   const data = response?.data ?? response ?? {};

   return {
      loadingType: normalizeLeadParamList(
         data[leadTransportationFields.loadingType],
      ),
      packagingType: normalizeLeadParamList(
         data[leadTransportationFields.packagingType],
      ),
      compositionType: normalizeLeadParamList(
         data[leadTransportationFields.compositionType],
      ),
      transportType: normalizeLeadParamList(
         data[leadTransportationFields.transportType],
      ),
   };
}

export async function fetchLeadParamsApi() {
   const response = await apiClient.get('/customer/v1/lead-params');

   return response.data;
}

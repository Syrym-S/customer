import { apiClient } from "../../../shared/api/api-client";

function getCurrenciesFromResponse(response) {
   const data = response?.data ?? response;

   if (Array.isArray(data)) {
      return data;
   }

   if (Array.isArray(data?.results)) {
      return data.results;
   }

   if (Array.isArray(data?.data?.results)) {
      return data.data.results;
   }

   if (Array.isArray(data?.data)) {
      return data.data;
   }

   return [];
}

export function normalizeCurrencyOption(currency) {
   if (!currency) {
      return null;
   }

   if (typeof currency === 'string') {
      return {
         code: currency,
         fullname: currency,
         rate: null,
         quant: null,
         raw: currency,
      };
   }

   const code = String(currency.code || currency.value || '').trim();

   if (!code) {
      return null;
   }

   return {
      code,
      fullname: currency.fullname || currency.name || currency.title || code,
      rate: currency.rate ?? null,
      quant: currency.quant ?? null,
      raw: currency,
   };
}

export function normalizeCurrenciesResponse(response) {
   return getCurrenciesFromResponse(response)
      .map(normalizeCurrencyOption)
      .filter(Boolean);
}

export async function fetchCustomerCurrenciesApi() {
   const response = await apiClient.get('/customer/v1/currencies');

   return normalizeCurrenciesResponse(response);
}

export async function searchCustomerCurrenciesApi(search) {
   const response = await apiClient.get('/customer/v1/currencies/search', {
      params: {
         search,
      },
   });

   return normalizeCurrenciesResponse(response);
}
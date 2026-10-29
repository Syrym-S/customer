import { formatAmount } from '../../../shared/helpers/currency-format.helpers';
import i18n from '../../../shared/i18n';
import {
   getPointScheduleByIndex,
   getPointScheduleLabel,
} from '../../customer-leads/model/lead-route.helpers';

const COUNTRY_PREFIX = 'Казахстан ';
const COUNTRY_SUFFIX = ', Казахстан';

export function stripCountryFromAddress(address) {
   if (typeof address !== 'string') {
      return '';
   }

   let result = address;

   if (result.startsWith(COUNTRY_PREFIX)) {
      result = result.slice(COUNTRY_PREFIX.length);
   }

   if (result.endsWith(COUNTRY_SUFFIX)) {
      result = result.slice(0, -COUNTRY_SUFFIX.length);
   }

   return result || address;
}

export function getStopsHint(count) {
   if (!count || count < 1) {
      return '';
   }

   return `+${i18n.t('tenders.stopCount', { count })}`;
}

export function getLeadOptionNumberLabel(option) {
   const number = Number(option?.num);

   if (Number.isFinite(number) && number > 0) {
      return `№${number}`;
   }

   return option?.shortId ? `#${option.shortId}` : '';
}

export function getLeadOptionCargoLabel(option) {
   const names = Array.isArray(option?.cargoNames) ? option.cargoNames : [];

   if (!names.length) {
      return option?.cargo || '';
   }

   return names.length > 1 ? `${names[0]} +${names.length - 1}` : names[0];
}

export function getLeadOptionRoute(option) {
   const fromFull = option?.from || '';
   const toFull = option?.to || '';
   const fromCity = option?.fromCity || '';
   const toCity = option?.toCity || '';

   if (fromCity && toCity) {
      return [
         { text: fromCity, full: fromFull },
         { text: toCity, full: toFull },
      ];
   }

   return [
      { text: stripCountryFromAddress(fromFull), full: fromFull },
      { text: stripCountryFromAddress(toFull), full: toFull },
   ];
}

export function getLeadOptionPriceLabel(option) {
   const price = Number(option?.price);

   if (!Number.isFinite(price) || price <= 0) {
      return '';
   }

   const formattedAmount = formatAmount(price);

   return formattedAmount ? `${formattedAmount} KZT` : '';
}

export function getLeadOptionDateLabel(option) {
   const schedule = getPointScheduleByIndex(option?.pointSchedules, 0);

   return getPointScheduleLabel(schedule) || '';
}

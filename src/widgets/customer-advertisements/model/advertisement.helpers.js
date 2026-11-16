import i18n from '../../../shared/i18n';
import { formatAmount } from '../../../shared/helpers/currency-format.helpers';

export function isAdvertisementClosed(advertisement) {
   return Boolean(advertisement?.closedAt);
}

export function getAdvertisementStatusLabel(advertisement) {
   return isAdvertisementClosed(advertisement)
      ? i18n.t('advertisements.status.closed')
      : i18n.t('advertisements.status.active');
}

export function getAdvertisementStatusColor(advertisement) {
   return isAdvertisementClosed(advertisement) ? 'text.disabled' : 'success.main';
}

export function formatAdvertisementDateTime(value) {
   if (!value || typeof value !== 'string') {
      return '';
   }

   const [datePart, timePart = ''] = value.replace('T', ' ').split(' ');
   const [year, month, day] = datePart.split('-');

   if (!year || !month || !day) {
      return '';
   }

   const time = timePart.slice(0, 5);
   const date = `${day}.${month}.${year}`;

   return time ? `${date}, ${time}` : date;
}

export function getAdvertisementLeadNumberLabel(lead) {
   const number = Number(lead?.num);

   return Number.isFinite(number) && number > 0 ? `№${number}` : '';
}

export function formatAdvertisementAmount(value, currency) {
   const price = Number(value);

   if (!Number.isFinite(price) || price <= 0) {
      return '';
   }

   const amount = formatAmount(price);

   return amount ? `${amount} ${currency || 'KZT'}` : '';
}

export function getAdvertisementPriceLabel(lead) {
   return formatAdvertisementAmount(lead?.price, lead?.currency);
}

export function getAdvertisementVatLabel(lead) {
   const vat = lead?.vat;

   if (vat === null || vat === undefined || vat === '') {
      return '';
   }

   if (typeof vat === 'boolean') {
      return vat
         ? i18n.t('common.fields.withVat')
         : i18n.t('common.fields.withoutVat');
   }

   return String(vat);
}

export function getAdvertisementCargoDimensionsLabel(cargo) {
   const length = Number(cargo?.lengthCm);
   const width = Number(cargo?.widthCm);
   const height = Number(cargo?.heightCm);

   const hasAll = [length, width, height].every(
      (value) => Number.isFinite(value) && value > 0,
   );

   if (!hasAll) {
      return '';
   }

   return i18n.t('common.units.dimensionsCm', { length, width, height });
}

export function getAdvertisementWeightLabel(value) {
   const weight = Number(value);

   if (!Number.isFinite(weight) || weight <= 0) {
      return '';
   }

   return i18n.t('common.units.kg', { value: formatAmount(weight) || weight });
}

export function getAdvertisementVolumeLabel(value) {
   const volume = Number(value);

   if (!Number.isFinite(volume) || volume <= 0) {
      return '';
   }

   return i18n.t('common.units.m3', { value: volume });
}

export function getAdvertisementGracePeriodLabel(value) {
   const days = Number(value);

   if (!Number.isFinite(days) || days <= 0) {
      return '';
   }

   return i18n.t('common.units.days', { count: days });
}

export function getAdvertisementRouteLabel(lead) {
   const from = lead?.fromLocation || i18n.t('common.empty.notSpecifiedN');
   const to = lead?.toLocation || i18n.t('common.empty.notSpecifiedN');

   return `${from} — ${to}`;
}

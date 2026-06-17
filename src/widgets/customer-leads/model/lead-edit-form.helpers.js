export function createLeadEditForm(lead) {
   if (!lead) {
      return {
         from_location: '',
         to_location: '',
         fromLat: '',
         fromLng: '',
         toLat: '',
         toLng: '',

         cargoName: '',
         cargoType: 'Не указан',
         weight_kg: '',
         cargoLengthCm: '',
         cargoWidthCm: '',
         cargoHeightCm: '',
         cargoDescription: '',

         summ: '',
         currency: 'KZT',
         vat: 'без НДС',
         loadingDate: '',

         driver: '',
         forwarder: '',
         forwarderData: null,
      };
   }

   return {
      from_location: normalizeLocationValue(lead.from_location),
      to_location: normalizeLocationValue(lead.to_location),

      fromLat: lead.raw?.route?.from?.lat ?? '',
      fromLng: lead.raw?.route?.from?.lng ?? '',
      toLat: lead.raw?.route?.to?.lat ?? '',
      toLng: lead.raw?.route?.to?.lng ?? '',

      cargoName: lead.cargo?.name ?? '',
      cargoType: lead.cargo?.type || 'Не указан',
      weight_kg: lead.cargo?.weight_kg ?? '',
      cargoLengthCm: lead.cargo?.length_cm ?? '',
      cargoWidthCm: lead.cargo?.width_cm ?? '',
      cargoHeightCm: lead.cargo?.height_cm ?? '',
      cargoDescription:
         lead.cargo?.context ??
         lead.cargo?.comment ??
         lead.cargo?.description ??
         '',

      summ: lead.summ ?? '',
      currency: normalizeCurrency(lead.currency),
      vat: lead.vat || 'без НДС',
      loadingDate: lead.raw?.loading_date || '',

      driver: lead.raw?.driver?.id || lead.driver?.id || '',
      forwarder: lead.forwarder?.id || '',
      forwarderData: lead.forwarder || null,
   };
}

function normalizeText(value) {
   if (value === null || value === undefined) {
      return '';
   }

   if (typeof value === 'object') {
      return normalizeLocationValue(value).replace(/\s+/g, ' ');
   }

   return String(value).trim().replace(/\s+/g, ' ');
}

export function normalizeLocationValue(value) {
   if (value === null || value === undefined) {
      return '';
   }

   if (typeof value === 'string') {
      return value.trim();
   }

   if (typeof value === 'number') {
      return String(value);
   }

   if (typeof value === 'object') {
      const preferredKeys = [
         'city',
         'address',
         'name',
         'title',
         'label',
         'value',
         'fullAddress',
         'formatted_address',
         'location',
      ];

      for (const key of preferredKeys) {
         if (typeof value[key] === 'string' && value[key].trim()) {
            return value[key].trim();
         }
      }

      return Object.values(value)
         .filter((item) => typeof item === 'string' && item.trim())
         .join(', ');
   }

   return '';
}

export function normalizePersonValue(value) {
   if (value === null || value === undefined) {
      return 'Не указан';
   }

   if (typeof value === 'string') {
      return value.trim() || 'Не указан';
   }

   if (typeof value === 'number') {
      return String(value);
   }

   if (typeof value === 'object') {
      const fio = value.fio || value.fullName || value.name;
      const phone = value.phone;
      const id = value.id;

      if (fio && phone) {
         return `${fio} · ${phone}`;
      }

      if (fio) {
         return fio;
      }

      if (phone) {
         return phone;
      }

      if (id) {
         return id;
      }

      return 'Не указан';
   }

   return 'Не указан';
}

const CURRENCIES = ['KZT', 'USD', 'EUR', 'RUB'];

function normalizeCurrency(value) {
   const currency = normalizeText(value).toUpperCase();

   return CURRENCIES.includes(currency) ? currency : 'KZT';
}

export function normalizeNumber(value) {
   if (value === '' || value === null || value === undefined) {
      return null;
   }

   const numberValue = Number(value);

   return Number.isNaN(numberValue) ? null : numberValue;
}

function hasTextChanged(nextValue, prevValue) {
   return normalizeText(nextValue) !== normalizeText(prevValue);
}

function hasNumberChanged(nextValue, prevValue) {
   return normalizeNumber(nextValue) !== normalizeNumber(prevValue);
}

function isValidMongoId(value) {
   return /^[a-f0-9]{24}$/.test(String(value ?? ''));
}

function addTextIfChanged(payload, key, nextValue, prevValue) {
   const normalizedNextValue = normalizeText(nextValue);

   if (!normalizedNextValue) {
      return;
   }

   if (hasTextChanged(nextValue, prevValue)) {
      payload[key] = normalizedNextValue;
   }
}

function addNumberIfChanged(payload, key, nextValue, prevValue) {
   const normalizedNextValue = normalizeNumber(nextValue);

   if (normalizedNextValue === null) {
      return;
   }

   if (hasNumberChanged(nextValue, prevValue)) {
      payload[key] = normalizedNextValue;
   }
}

export function mapLeadEditFormToApi(editForm, currentLead) {
   const payload = {};

   const nextForwarderId = editForm.forwarder;
   const currentForwarderId = currentLead.forwarder?.id;

   if (
      isValidMongoId(nextForwarderId) &&
      nextForwarderId !== currentForwarderId
   ) {
      payload.forwarder = nextForwarderId;
   }

   const nextDriverId = editForm.driver;
   const currentDriverId = currentLead.raw?.driver?.id;

   if (isValidMongoId(nextDriverId) && nextDriverId !== currentDriverId) {
      payload.driver = nextDriverId;
   }

   // ВАЖНО:
   // Не отправляем одно и то же значение одновременно в city и address.
   // Иначе backend склеивает дубли при каждом update.
   addTextIfChanged(
      payload,
      'from_city',
      editForm.from_location,
      currentLead.from_location,
   );

   addTextIfChanged(
      payload,
      'to_city',
      editForm.to_location,
      currentLead.to_location,
   );

   addNumberIfChanged(
      payload,
      'from_lat',
      editForm.fromLat,
      currentLead.raw?.route?.from?.lat,
   );
   addNumberIfChanged(
      payload,
      'from_lon',
      editForm.fromLng,
      currentLead.raw?.route?.from?.lng,
   );
   addNumberIfChanged(
      payload,
      'to_lat',
      editForm.toLat,
      currentLead.raw?.route?.to?.lat,
   );
   addNumberIfChanged(
      payload,
      'to_lon',
      editForm.toLng,
      currentLead.raw?.route?.to?.lng,
   );

   addNumberIfChanged(payload, 'price', editForm.summ, currentLead.summ);

   const nextCurrency = normalizeCurrency(editForm.currency);
   const prevCurrency = normalizeCurrency(currentLead.currency);

   if (nextCurrency !== prevCurrency) {
      payload.currency = nextCurrency;
   }

   addTextIfChanged(payload, 'vat', editForm.vat, currentLead.vat);
   addTextIfChanged(
      payload,
      'loading_date',
      editForm.loadingDate,
      currentLead.raw?.loading_date,
   );

   const cargoTypeChanged = hasTextChanged(
      editForm.cargoType,
      currentLead.cargo?.type,
   );

   const cargoWeightChanged = hasNumberChanged(
      editForm.weight_kg,
      currentLead.cargo?.weight_kg,
   );

   const cargoLengthChanged = hasNumberChanged(
      editForm.cargoLengthCm,
      currentLead.cargo?.length_cm,
   );

   const cargoWidthChanged = hasNumberChanged(
      editForm.cargoWidthCm,
      currentLead.cargo?.width_cm,
   );

   const cargoHeightChanged = hasNumberChanged(
      editForm.cargoHeightCm,
      currentLead.cargo?.height_cm,
   );

   const cargoDescriptionChanged = hasTextChanged(
      editForm.cargoDescription,
      currentLead.cargo?.context || currentLead.cargo?.description,
   );

   const hasCargoChanges =
      cargoTypeChanged ||
      cargoWeightChanged ||
      cargoLengthChanged ||
      cargoWidthChanged ||
      cargoHeightChanged ||
      cargoDescriptionChanged;

   if (hasCargoChanges) {
      const cargoType = normalizeText(editForm.cargoType) || 'Не указан';

      payload.cargo_name = cargoType;
      payload.cargo_type = cargoType;

      addPositiveIntegerValue(payload, 'cargo_weight', editForm.weight_kg);
      addPositiveIntegerValue(payload, 'cargo_length', editForm.cargoLengthCm);
      addPositiveIntegerValue(payload, 'cargo_width', editForm.cargoWidthCm);
      addPositiveIntegerValue(payload, 'cargo_height', editForm.cargoHeightCm);

      if (cargoDescriptionChanged) {
         payload.comment = normalizeText(editForm.cargoDescription);
      }
   }

   return payload;
}

function addPositiveIntegerValue(payload, key, value) {
   const normalizedValue = normalizeNumber(value);

   if (normalizedValue === null || normalizedValue <= 0) {
      return;
   }

   payload[key] = Math.round(normalizedValue);
}

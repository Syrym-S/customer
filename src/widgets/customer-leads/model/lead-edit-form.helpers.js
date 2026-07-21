function createEmptyLeadCargoEditForm() {
   return {
      name: '',
      description: '',
      weight_kg: '',
      cargo_price: '',
      type: 'Не указан',
      width_cm: '',
      height_cm: '',
      length_cm: '',
   };
}

function normalizeLeadCargosForEdit(lead) {
   const sourceCargos = Array.isArray(lead?.cargos) ? lead.cargos : [];

   if (!sourceCargos.length) {
      return [createEmptyLeadCargoEditForm()];
   }

   return sourceCargos.map((cargo) => ({
      name: normalizeText(cargo.name),
      description: cargo.description ?? cargo.context ?? '',
      weight_kg: cargo.weight_kg ?? '',
      cargo_price: cargo.cargo_price ?? '',
      type: normalizeCargoTypeForUi(cargo.type),
      width_cm: cargo.width_cm ?? '',
      height_cm: cargo.height_cm ?? '',
      length_cm: cargo.length_cm ?? '',
   }));
}

function addTextIfHasValue(payload, key, value) {
   const normalizedValue = normalizeText(value);

   if (normalizedValue) {
      payload[key] = normalizedValue;
   }
}

function addNumberIfHasValue(payload, key, value) {
   const normalizedValue = normalizeNumber(value);

   if (normalizedValue !== null) {
      payload[key] = normalizedValue;
   }
}

function normalizeCargoForPayload(cargo = {}) {
   const payload = {};

   const name = normalizeText(cargo.name);
   const description = normalizeText(cargo.description ?? cargo.context);
   const type = normalizeCargoTypeForPayload(cargo.type);

   addTextIfHasValue(payload, 'name', name);
   addTextIfHasValue(payload, 'description', description);
   addTextIfHasValue(payload, 'type', type);

   addNumberIfHasValue(payload, 'weight_kg', cargo.weight_kg);
   addNumberIfHasValue(payload, 'cargo_price', cargo.cargo_price);
   addNumberIfHasValue(payload, 'width_cm', cargo.width_cm);
   addNumberIfHasValue(payload, 'height_cm', cargo.height_cm);
   addNumberIfHasValue(payload, 'length_cm', cargo.length_cm);

   return payload;
}

function normalizeCargosForPayload(cargos) {
   if (!Array.isArray(cargos)) {
      return [];
   }

   return cargos.map(normalizeCargoForPayload).filter((cargo) => {
      return Boolean(cargo.name);
   });
}

function areCargosEqual(nextCargos, currentCargos) {
   return JSON.stringify(nextCargos) === JSON.stringify(currentCargos);
}

export function createLeadEditForm(lead) {
   const cargos = normalizeLeadCargosForEdit(lead);

   if (!lead) {
      return {
         from_location: '',
         to_location: '',
         fromLat: '',
         fromLng: '',
         toLat: '',
         toLng: '',

         cargos: [createEmptyLeadCargoEditForm()],

         price: '',
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

      cargos,

      price: lead.price ?? '',
      summ: lead.price ?? '',

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

function normalizeCargoTypeForUi(value) {
   const normalizedValue = normalizeText(value);

   return normalizedValue || 'Не указан';
}

function normalizeCargoTypeForPayload(value) {
   const normalizedValue = normalizeText(value);

   if (!normalizedValue || normalizedValue === 'Не указан') {
      return '';
   }

   return normalizedValue;
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
         'address',
         'fullAddress',
         'formatted_address',
         'location',
         'name',
         'title',
         'label',
         'value',
         'city',
         'region',
         'country',
      ];

      for (const key of preferredKeys) {
         if (typeof value[key] === 'string' && value[key].trim()) {
            return value[key].trim();
         }
      }

      const parts = [
         value.country,
         value.region,
         value.city,
         value.address,
      ].filter((item) => typeof item === 'string' && item.trim());

      return parts.join(', ');
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

function normalizeCurrency(value) {
   const currency = normalizeText(value).toUpperCase();

   return currency || 'KZT';
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

   const isForwarderCreatedLead = currentLead?.created_by === 'forwarder';

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

   if (!isForwarderCreatedLead) {
      addNumberIfChanged(payload, 'price', editForm.price, currentLead.price);
   }

   const nextCurrency = normalizeCurrency(editForm.currency);
   const prevCurrency = normalizeCurrency(currentLead.currency);

   if (!isForwarderCreatedLead && nextCurrency !== prevCurrency) {
      payload.currency = nextCurrency;
   }

   addTextIfChanged(payload, 'vat', editForm.vat, currentLead.vat);
   addTextIfChanged(
      payload,
      'loading_date',
      editForm.loadingDate,
      currentLead.raw?.loading_date,
   );

   const nextCargos = normalizeCargosForPayload(editForm.cargos);
   const currentCargos = normalizeCargosForPayload(currentLead.cargos);

   if (!areCargosEqual(nextCargos, currentCargos)) {
      payload.cargos = nextCargos;
   }

   return payload;
}

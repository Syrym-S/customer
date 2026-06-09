function hasValue(value) {
   return value !== null && value !== undefined && value !== '';
}

function toNumber(value) {
   if (!hasValue(value)) {
      return null;
   }

   const number = Number(value);

   return Number.isNaN(number) ? null : number;
}

function addIfHasValue(target, key, value) {
   if (hasValue(value)) {
      target[key] = value;
   }
}

function addNumberIfHasValue(target, key, value) {
   const number = toNumber(value);

   if (number !== null) {
      target[key] = number;
   }
}

function normalizeText(value) {
   return String(value ?? '').trim();
}

export function mapCreateLeadFormToApi(form) {
   const fromLocation = normalizeText(form.fromLocation);
   const toLocation = normalizeText(form.toLocation);

   const payload = {
      forwarder: form.forwarderId,

      from_country: 'Казахстан',
      from_region: '',
      from_city: fromLocation,
      from_address: fromLocation,

      to_country: 'Казахстан',
      to_region: '',
      to_city: toLocation,
      to_address: toLocation,

      cargo_name: form.cargoType || 'Не указан',
      cargo_type: form.cargoType || 'Не указан',
      currency: form.currency || 'KZT',
      vat: form.vat ? 'с НДС' : 'без НДС',
   };

   addIfHasValue(payload, 'loading_date', form.loadingDate);
   addIfHasValue(payload, 'comment', normalizeText(form.comment));

   addNumberIfHasValue(payload, 'from_lat', form.fromLat);
   addNumberIfHasValue(payload, 'from_lon', form.fromLng);
   addNumberIfHasValue(payload, 'to_lat', form.toLat);
   addNumberIfHasValue(payload, 'to_lon', form.toLng);

   addNumberIfHasValue(payload, 'cargo_weight', form.weightKg);
   addNumberIfHasValue(payload, 'cargo_length', form.cargoLengthCm);
   addNumberIfHasValue(payload, 'cargo_width', form.cargoWidthCm);
   addNumberIfHasValue(payload, 'cargo_height', form.cargoHeightCm);

   addNumberIfHasValue(payload, 'price', form.price);

   return payload;
}

export function mapCreateLeadDocumentsToApiDocuments(form) {
   return (form.documents || [])
      .filter((document) => document.file)
      .map((document) => ({
         name: document.name || document.fileName || 'Документ',
         context: document.context || '',
         file: document.file,
      }));
}

export function mapCreatedLeadToUi(form, response) {
   const id = response?.id ?? `created-lead-${Date.now()}`;

   return {
      id,
      num: response?.num ?? id,

      customer:
         response?.customer?.name ||
         response?.customer ||
         response?.creator?.name ||
         'Текущий заказчик',

      forwarder: form.forwarder ?? {
         id: form.forwarderId || null,
         fullName: 'Не указан',
         companyName: '',
         companyBin: '',
         phone: '',
      },

      from_location: form.fromLocation || 'Не указано',
      to_location: form.toLocation || 'Не указано',

      summ: Number(form.price) || 0,
      currency: form.currency || 'KZT',

      status: response?.status || 'new',

      transportation_price: null,
      vat: form.vat ? 'с НДС' : 'без НДС',
      gsm: false,
      created_at: response?.created_at ?? null,
      updated_at: null,

      cargo: {
         name: form.cargoType || 'Не указан',
         description: form.comment || '',
         context: null,
         weight_kg: Number(form.weightKg) || 0,
         type: form.cargoType || 'Не указан',
         volume_cm: null,
         width_cm: Number(form.cargoWidthCm) || null,
         height_cm: Number(form.cargoHeightCm) || null,
         length_cm: Number(form.cargoLengthCm) || null,
      },

      driver: 'Не назначен',

      creator: null,
      person: null,
      files: [],
      agreement: null,
      geows: null,

      type_of_loading: 'Не указан',
      type_of_packaging: 'Не указан',
      type_of_composition: 'Не указан',
      type_of_transport: 'Не указан',
      gos_number: null,

      raw: {
         ...response,
         route: {
            from: {
               lat: form.fromLat ? Number(form.fromLat) : null,
               lng: form.fromLng ? Number(form.fromLng) : null,
            },
            to: {
               lat: form.toLat ? Number(form.toLat) : null,
               lng: form.toLng ? Number(form.toLng) : null,
            },
         },
      },
   };
}

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

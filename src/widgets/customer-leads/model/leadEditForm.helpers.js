export function createLeadEditForm(lead) {
   if (!lead) {
      return {
         from_location: '',
         to_location: '',
         fromLat: '',
         fromLng: '',
         toLat: '',
         toLng: '',
         cargoType: '',
         weight_kg: '',
         cargoLengthCm: '',
         cargoWidthCm: '',
         cargoHeightCm: '',
         summ: '',
         currency: '',
         vat: '',
         loadingDate: '',
         cargoDescription: '',
         driver: '',
         forwarder: '',
      };
   }

   return {
      from_location: lead.from_location?.trim() || '',
      to_location: lead.to_location?.trim() || '',
      fromLat: lead.raw?.route?.from?.lat ?? '',
      fromLng: lead.raw?.route?.from?.lng ?? '',
      toLat: lead.raw?.route?.to?.lat ?? '',
      toLng: lead.raw?.route?.to?.lng ?? '',
      cargoType: lead.cargo?.type || '',
      weight_kg: lead.cargo?.weight_kg || '',
      cargoLengthCm: lead.cargo?.length_cm || '',
      cargoWidthCm: lead.cargo?.width_cm || '',
      cargoHeightCm: lead.cargo?.height_cm || '',
      summ: lead.summ || '',
      currency: lead.currency || '',
      vat: lead.vat || '',
      loadingDate: lead.raw?.loading_date || '',
      cargoDescription: lead.cargo?.description || lead.cargo?.context || '',
      driver: lead.raw?.driver?.id || lead.driver || '',
      forwarder: lead.forwarder?.id || '',
   };
}

export function normalizeNumber(value) {
   if (value === '') {
      return value;
   }

   const numberValue = Number(value);

   return Number.isNaN(numberValue) ? value : numberValue;
}

function hasValue(value) {
   return value !== null && value !== undefined && value !== '';
}

function normalizeText(value) {
   return String(value ?? '').trim();
}

function addIfHasValue(target, key, value) {
   if (hasValue(value)) {
      target[key] = value;
   }
}

function addNumberIfHasValue(target, key, value) {
   if (!hasValue(value)) {
      return;
   }

   const numberValue = Number(value);

   if (!Number.isNaN(numberValue)) {
      target[key] = numberValue;
   }
}

function isHexId(value) {
   return /^[a-f0-9]{24}$/.test(String(value ?? '').trim());
}

export function mapLeadEditFormToApi(editForm) {
   const fromLocation = normalizeText(editForm.from_location);
   const toLocation = normalizeText(editForm.to_location);

   const payload = {};

   if (isHexId(editForm.forwarder)) {
      payload.forwarder = editForm.forwarder;
   }

   if (isHexId(editForm.driver)) {
      payload.driver = editForm.driver;
   }

   if (fromLocation) {
      payload.from_city = fromLocation;
      payload.from_address = fromLocation;
   }

   if (toLocation) {
      payload.to_city = toLocation;
      payload.to_address = toLocation;
   }

   addNumberIfHasValue(payload, 'from_lat', editForm.fromLat);
   addNumberIfHasValue(payload, 'from_lon', editForm.fromLng);
   addNumberIfHasValue(payload, 'to_lat', editForm.toLat);
   addNumberIfHasValue(payload, 'to_lon', editForm.toLng);

   addIfHasValue(payload, 'cargo_name', editForm.cargoType);
   addIfHasValue(payload, 'cargo_type', editForm.cargoType);
   addNumberIfHasValue(payload, 'cargo_weight', editForm.weight_kg);
   addNumberIfHasValue(payload, 'cargo_length', editForm.cargoLengthCm);
   addNumberIfHasValue(payload, 'cargo_width', editForm.cargoWidthCm);
   addNumberIfHasValue(payload, 'cargo_height', editForm.cargoHeightCm);

   addNumberIfHasValue(payload, 'price', editForm.summ);
   addIfHasValue(payload, 'currency', editForm.currency);
   addIfHasValue(payload, 'vat', editForm.vat);
   addIfHasValue(payload, 'loading_date', editForm.loadingDate);

   addIfHasValue(payload, 'comment', normalizeText(editForm.cargoDescription));

   return payload;
}

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

function createEmptyLocation() {
   return {
      country: '',
      region: '',
      city: '',
      address: '',
      label: '',
   };
}

function getLocationCoordinate(location, keys) {
   if (!location || typeof location !== 'object') {
      return '';
   }

   for (const key of keys) {
      const value = location[key];

      if (value === null || value === undefined || value === '') {
         continue;
      }

      const number = Number(value);

      if (!Number.isNaN(number)) {
         return number;
      }
   }

   return '';
}

function normalizeLocationDataForEdit(location) {
   if (!location || typeof location !== 'object') {
      return createEmptyLocation();
   }

   const address = normalizeLocationValue(location);

   return {
      country: location.country || '',
      region: location.region || '',
      city: location.city || '',
      address,
      label: address,
   };
}

function normalizeLeadWaypointsForEdit(lead) {
   const sourceWaypoints = Array.isArray(lead?.waypoints) ? lead.waypoints : [];

   return sourceWaypoints.map((waypoint, index) => {
      const address = normalizeLocationValue(waypoint);

      return {
         id: waypoint.id || `waypoint-${index}`,
         location: address,
         lat: waypoint.lat ?? '',
         lng: waypoint.lng ?? waypoint.lon ?? '',
         location_data: {
            country: waypoint.country || '',
            region: waypoint.region || '',
            city: waypoint.city || '',
            address,
            label: address,
         },
      };
   });
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
         fromLocation: '',
         from_location: createEmptyLocation(),
         fromLat: '',
         fromLng: '',

         toLocation: '',
         to_location: createEmptyLocation(),
         toLat: '',
         toLng: '',

         waypoints: [],

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

   const fromLocationLabel = normalizeLocationValue(lead.from_location);
   const toLocationLabel = normalizeLocationValue(lead.to_location);

   return {
      fromLocation: fromLocationLabel,
      from_location: normalizeLocationDataForEdit(lead.from_location),

      toLocation: toLocationLabel,
      to_location: normalizeLocationDataForEdit(lead.to_location),

      fromLat:
         getLocationCoordinate(lead.from_location, ['lat', 'latitude']) ||
         lead.raw?.route?.from?.lat ||
         '',

      fromLng:
         getLocationCoordinate(lead.from_location, [
            'lng',
            'lon',
            'longitude',
         ]) ||
         lead.raw?.route?.from?.lng ||
         lead.raw?.route?.from?.lon ||
         '',

      toLat:
         getLocationCoordinate(lead.to_location, ['lat', 'latitude']) ||
         lead.raw?.route?.to?.lat ||
         '',

      toLng:
         getLocationCoordinate(lead.to_location, ['lng', 'lon', 'longitude']) ||
         lead.raw?.route?.to?.lng ||
         lead.raw?.route?.to?.lon ||
         '',

      waypoints: normalizeLeadWaypointsForEdit(lead),

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

function normalizeWaypointForPayload(waypoint = {}) {
   const locationData = waypoint.location_data || {};

   const lat = normalizeNumber(waypoint.lat);
   const lon = normalizeNumber(waypoint.lng ?? waypoint.lon);

   if (lat === null || lon === null) {
      return null;
   }

   return {
      country: normalizeText(locationData.country) || null,
      region: normalizeText(locationData.region) || null,
      city: normalizeText(locationData.city) || null,
      address:
         normalizeText(locationData.address) ||
         normalizeText(locationData.label) ||
         normalizeText(waypoint.location) ||
         null,
      lat,
      lon,
   };
}

function normalizeWaypointsForPayload(waypoints) {
   if (!Array.isArray(waypoints)) {
      return [];
   }

   return waypoints.map(normalizeWaypointForPayload).filter(Boolean);
}

function areWaypointsEqual(nextWaypoints, currentWaypoints) {
   return JSON.stringify(nextWaypoints) === JSON.stringify(currentWaypoints);
}

function addLocationFieldsIfChanged(
   payload,
   prefix,
   nextLocation,
   currentLocation,
) {
   const nextLocationData = nextLocation.data || {};
   const nextText = normalizeText(nextLocation.text);
   const currentText = normalizeLocationValue(currentLocation);

   const hasStructuredAddress =
      typeof nextLocationData === 'object' &&
      normalizeText(nextLocationData.address);

   if (!hasStructuredAddress) {
      addTextIfChanged(payload, `${prefix}_city`, nextText, currentText);
      return;
   }

   const fields = ['country', 'region', 'city', 'address'];

   fields.forEach((field) => {
      const nextValue = normalizeText(nextLocationData[field]);
      const currentValue =
         currentLocation && typeof currentLocation === 'object'
            ? normalizeText(currentLocation[field])
            : '';

      if (nextValue && nextValue !== currentValue) {
         payload[`${prefix}_${field}`] = nextValue;
      }
   });
}

function getLocationFieldValue(location, key) {
   if (!location || typeof location !== 'object') {
      return '';
   }

   return normalizeText(location[key]);
}

function getPayloadLocationData(locationData, fallbackText) {
   const data =
      locationData && typeof locationData === 'object' ? locationData : {};

   const fallback = normalizeText(fallbackText);

   return {
      country: normalizeText(data.country),
      region: normalizeText(data.region),
      city: normalizeText(data.city),
      address:
         normalizeText(data.address) || normalizeText(data.label) || fallback,
   };
}

function hasRouteLocationChanged({
   nextLocationData,
   nextLat,
   nextLng,
   currentLocation,
}) {
   const fields = ['country', 'region', 'city', 'address'];

   const hasTextChanges = fields.some((field) => {
      return (
         normalizeText(nextLocationData[field]) !==
         getLocationFieldValue(currentLocation, field)
      );
   });

   const currentLat = getLocationCoordinate(currentLocation, [
      'lat',
      'latitude',
   ]);

   const currentLng = getLocationCoordinate(currentLocation, [
      'lng',
      'lon',
      'longitude',
   ]);

   return (
      hasTextChanges ||
      normalizeNumber(nextLat) !== normalizeNumber(currentLat) ||
      normalizeNumber(nextLng) !== normalizeNumber(currentLng)
   );
}

function addRouteLocationIfChanged({
   payload,
   prefix,
   text,
   locationData,
   lat,
   lng,
   currentLocation,
}) {
   const nextLocationData = getPayloadLocationData(locationData, text);

   const hasChanged = hasRouteLocationChanged({
      nextLocationData,
      nextLat: lat,
      nextLng: lng,
      currentLocation,
   });

   if (!hasChanged) {
      return;
   }

   if (nextLocationData.country) {
      payload[`${prefix}_country`] = nextLocationData.country;
   }

   if (nextLocationData.region) {
      payload[`${prefix}_region`] = nextLocationData.region;
   }

   if (nextLocationData.city) {
      payload[`${prefix}_city`] = nextLocationData.city;
   }

   if (nextLocationData.address) {
      payload[`${prefix}_address`] = nextLocationData.address;
   }

   const normalizedLat = normalizeNumber(lat);
   const normalizedLng = normalizeNumber(lng);

   if (normalizedLat !== null) {
      payload[`${prefix}_lat`] = normalizedLat;
   }

   if (normalizedLng !== null) {
      payload[`${prefix}_lon`] = normalizedLng;
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
   addRouteLocationIfChanged({
      payload,
      prefix: 'from',
      text: editForm.fromLocation,
      locationData: editForm.from_location,
      lat: editForm.fromLat,
      lng: editForm.fromLng,
      currentLocation: currentLead.from_location,
   });

   addRouteLocationIfChanged({
      payload,
      prefix: 'to',
      text: editForm.toLocation,
      locationData: editForm.to_location,
      lat: editForm.toLat,
      lng: editForm.toLng,
      currentLocation: currentLead.to_location,
   });

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

   const nextWaypoints = normalizeWaypointsForPayload(editForm.waypoints);
   const currentWaypoints = normalizeWaypointsForPayload(currentLead.waypoints);

   if (!areWaypointsEqual(nextWaypoints, currentWaypoints)) {
      payload.waypoints = nextWaypoints;
   }

   return payload;
}

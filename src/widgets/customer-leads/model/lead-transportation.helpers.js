export const leadTransportationFields = {
   loadingType: 'type_loading',
   packagingType: 'type_packaging',
   compositionType: 'type_composition',
   transportType: 'type_transport',
};

// Confirmed from the backend sample: create/update accept type_loading /
// type_packaging / type_composition / type_transport as the option's `name`
// string from GET /customer/v1/lead-params (e.g. "Задняя"), and the lead
// response returns that same string. All four are optional.
export const cargoVolumeField = 'volume';

function normalizeTransportationValue(rawValue) {
   if (rawValue === null || rawValue === undefined) {
      return null;
   }

   const name = String(rawValue).trim();

   return name || null;
}

export function getTransportationOptionLabel(rawValue) {
   return normalizeTransportationValue(rawValue);
}

export function getLoadingTypeLabel(rawValue) {
   return getTransportationOptionLabel(rawValue);
}

export function getPackagingTypeLabel(rawValue) {
   return getTransportationOptionLabel(rawValue);
}

export function getCompositionTypeLabel(rawValue) {
   return getTransportationOptionLabel(rawValue);
}

export function getTransportTypeLabel(rawValue) {
   return getTransportationOptionLabel(rawValue);
}

// The value a Select bound to one of the four fields should be initialized
// with when editing an existing lead.
export function getTransportationEditValue(rawValue) {
   return normalizeTransportationValue(rawValue) ?? '';
}

// The lead's current value may not be in the freshly loaded options list
// (e.g. it was set before the option was renamed/removed) — append it so
// the Select can still show and keep it selected instead of silently
// clearing it.
export function getTransportationSelectOptions(options = [], selectedValue) {
   const normalizedSelectedValue = normalizeTransportationValue(selectedValue);

   if (!normalizedSelectedValue) {
      return options;
   }

   const hasSelectedOption = options.some(
      (option) => option.value === normalizedSelectedValue,
   );

   if (hasSelectedOption) {
      return options;
   }

   return [
      ...options,
      { value: normalizedSelectedValue, label: normalizedSelectedValue },
   ];
}

// Converts a Select's value into the payload value. Empty/not selected
// means the field is omitted from the payload entirely — the caller must
// skip the key on null, it is never sent as null or the text 'Не указан'.
export function getTransportationPayloadValue(selectedValue) {
   return normalizeTransportationValue(selectedValue);
}

// Cubic centimeters per cubic meter — plain geometry, used only to convert
// the length/width/height dimension inputs (in cm) into m³. Unrelated to
// the backend wire unit below.
const CM3_PER_M3 = 1_000_000;

// Confirmed from the backend sample (200x150x300 cm → volume 9): the wire
// field `volume` is already in cubic meters, the same unit used internally,
// so these are identity conversions. Kept as functions (factor 1) so this
// stays the single seam if that ever changes.
//
// TODO: still unconfirmed — what the server does when both `volume` and the
// dimension fields are sent and disagree with each other.
const CARGO_VOLUME_BACKEND_UNITS_PER_M3 = 1;

function hasValue(value) {
   return value !== null && value !== undefined && value !== '';
}

function roundVolumeM3(value) {
   return Math.round(value * 1000) / 1000;
}

export function cargoVolumeM3ToBackend(volumeM3) {
   if (!hasValue(volumeM3)) {
      return null;
   }

   const number = Number(volumeM3);

   if (Number.isNaN(number)) {
      return null;
   }

   return roundVolumeM3(number * CARGO_VOLUME_BACKEND_UNITS_PER_M3);
}

export function cargoVolumeBackendToM3(volumeBackend) {
   if (!hasValue(volumeBackend)) {
      return null;
   }

   const number = Number(volumeBackend);

   if (Number.isNaN(number)) {
      return null;
   }

   return roundVolumeM3(number / CARGO_VOLUME_BACKEND_UNITS_PER_M3);
}

export function computeCargoVolumeM3(lengthCm, widthCm, heightCm) {
   if (!hasValue(lengthCm) || !hasValue(widthCm) || !hasValue(heightCm)) {
      return null;
   }

   const length = Number(lengthCm);
   const width = Number(widthCm);
   const height = Number(heightCm);

   if (Number.isNaN(length) || Number.isNaN(width) || Number.isNaN(height)) {
      return null;
   }

   return roundVolumeM3((length * width * height) / CM3_PER_M3);
}

export function formatCargoVolumeM3(volumeM3) {
   if (!hasValue(volumeM3)) {
      return null;
   }

   const number = Number(volumeM3);

   return Number.isNaN(number) ? null : `${number} м³`;
}

import { normalizeLocationValue } from '../../customer-leads/model/lead-edit-form.helpers';

function toNumberOrNull(value) {
   if (value === null || value === undefined || value === '') {
      return null;
   }

   const number = Number(value);

   return Number.isFinite(number) ? number : null;
}

function toPositiveNumberOrNull(value) {
   const number = toNumberOrNull(value);

   return number !== null && number > 0 ? number : null;
}

function toDateTimeString(value) {
   if (!value) {
      return '';
   }

   if (typeof value === 'string') {
      return value;
   }

   if (typeof value === 'object' && typeof value.date === 'string') {
      return value.date;
   }

   return '';
}

function joinLocationParts(parts) {
   const uniqueParts = [];

   for (const part of parts) {
      const text = String(part ?? '').trim();

      if (text && !uniqueParts.includes(text)) {
         uniqueParts.push(text);
      }
   }

   return uniqueParts.join(', ');
}

function getLocationLabels(location) {
   if (!location || typeof location !== 'object') {
      const label = normalizeLocationValue(location);

      return { label, fullLabel: label };
   }

   const fullLabel =
      joinLocationParts([
         location.country,
         location.region,
         location.city,
         location.address,
      ]) || normalizeLocationValue(location);

   const shortLabel =
      joinLocationParts([location.city, location.region]) || fullLabel;

   return { label: shortLabel, fullLabel };
}

function getFirstPointStartAt(apiLead) {
   const schedules = Array.isArray(apiLead?.point_schedules)
      ? apiLead.point_schedules.filter(Boolean)
      : [];

   if (schedules.length === 0) {
      return '';
   }

   const firstSchedule =
      schedules.find((schedule) => Number(schedule?.point_index) === 0) ||
      schedules[0];

   return firstSchedule?.start_at || '';
}

function getFirstCargo(apiLead) {
   if (Array.isArray(apiLead?.cargos)) {
      return apiLead.cargos.find(Boolean) || null;
   }

   return apiLead?.cargo || null;
}

function mapCargoDetailsFromApi(cargo) {
   if (!cargo) {
      return null;
   }

   return {
      name: cargo.name || '',
      description: cargo.description || '',
      type: cargo.type || '',
      weightKg: toPositiveNumberOrNull(cargo.weight_kg),
      widthCm: toPositiveNumberOrNull(cargo.width_cm),
      heightCm: toPositiveNumberOrNull(cargo.height_cm),
      lengthCm: toPositiveNumberOrNull(cargo.length_cm),
      cargoPrice: toPositiveNumberOrNull(cargo.cargo_price),
      volume: toPositiveNumberOrNull(cargo.volume),
      tnved: cargo.tnved || '',
   };
}

function mapWaypointsFromApi(apiLead) {
   const waypoints = Array.isArray(apiLead?.waypoints)
      ? apiLead.waypoints.filter(Boolean)
      : [];

   return waypoints.map((waypoint) => {
      const labels = getLocationLabels(waypoint);

      return {
         label: labels.fullLabel || labels.label,
         type: waypoint.type || '',
         isPassed: Boolean(waypoint.is_passed),
      };
   });
}

function mapPointSchedulesFromApi(apiLead) {
   const schedules = Array.isArray(apiLead?.point_schedules)
      ? apiLead.point_schedules.filter(Boolean)
      : [];

   return schedules
      .map((schedule, index) => ({
         pointIndex: toNumberOrNull(schedule.point_index) ?? index,
         startAt: toDateTimeString(schedule.start_at),
         endAt: toDateTimeString(schedule.end_at),
      }))
      .sort((first, second) => first.pointIndex - second.pointIndex);
}

function mapContactsFromApi(apiLead) {
   const contacts = apiLead?.contacts;

   if (!contacts) {
      return null;
   }

   const phone = contacts.phone || contacts.number || '';
   const email = contacts.email || '';

   if (!phone && !email) {
      return null;
   }

   return { phone, email };
}

export function mapAdvertisementLeadFromApi(apiLead) {
   if (!apiLead) {
      return null;
   }

   const from = getLocationLabels(apiLead.from_location);
   const to = getLocationLabels(apiLead.to_location);
   const cargo = getFirstCargo(apiLead);

   return {
      id: apiLead.id ?? null,
      num: toPositiveNumberOrNull(apiLead.num),
      status: apiLead.status || 'new',
      createdAt: toDateTimeString(apiLead.created_at),
      fromLocation: from.label,
      toLocation: to.label,
      fromLocationFull: from.fullLabel,
      toLocationFull: to.fullLabel,
      cargo: cargo?.name || '',
      weightKg: toPositiveNumberOrNull(cargo?.weight_kg),
      price: toPositiveNumberOrNull(apiLead.price ?? apiLead.summ),
      currency: apiLead.currency || 'KZT',
      firstPointAt: toDateTimeString(getFirstPointStartAt(apiLead)),
      transportationPrice: toPositiveNumberOrNull(apiLead.transportation_price),
      vat: apiLead.vat ?? null,
      gracePeriodDays: toPositiveNumberOrNull(apiLead.grace_period_days),
      typeTransport: apiLead.type_transport || '',
      typeLoading: apiLead.type_loading || '',
      typePackaging: apiLead.type_packaging || '',
      typeComposition: apiLead.type_composition || '',
      cargoDetails: mapCargoDetailsFromApi(cargo),
      pointSchedules: mapPointSchedulesFromApi(apiLead),
      waypoints: mapWaypointsFromApi(apiLead),
      contacts: mapContactsFromApi(apiLead),
      raw: apiLead,
   };
}

export function mapAdvertisementFromApi(apiAdvertisement) {
   if (!apiAdvertisement) {
      return null;
   }

   const lead = mapAdvertisementLeadFromApi(apiAdvertisement.lead);

   return {
      id: String(apiAdvertisement.id ?? ''),
      typeSource: apiAdvertisement.type_source || 'customer',
      expiredAt: toDateTimeString(apiAdvertisement.expired_at),
      closedAt: toDateTimeString(apiAdvertisement.closed_at) || null,
      createdAt: toDateTimeString(apiAdvertisement.created_at),
      leadId: lead?.id ?? null,
      lead,
   };
}

export function mapAdvertisementsResponseFromApi(
   data,
   { page = 1, perPage = 10 } = {},
) {
   const rawResults = Array.isArray(data?.results)
      ? data.results
      : Array.isArray(data)
        ? data
        : [];

   const results = rawResults.map(mapAdvertisementFromApi).filter(Boolean);

   return {
      results,
      page: toPositiveNumberOrNull(data?.page) ?? page,
      perPage: toPositiveNumberOrNull(data?.per_page) ?? perPage,
      count: toNumberOrNull(data?.count) ?? results.length,
   };
}

export function mapCreatedLeadToAdvertisementLead(createdLead) {
   return mapAdvertisementLeadFromApi(createdLead?.raw || createdLead);
}

import {
   formatDateToTenderApiDateTime,
   parseTenderApiDateTime,
} from './tender.helpers';

function padDatePart(value) {
   return String(value).padStart(2, '0');
}

// The backend validates/stores this as Asia/Almaty wall-clock time, not UTC
// (see tender.helpers.js's parseTenderApiDateTime for why — do not "fix"
// this back to UTC). parseTenderApiDateTime resolves the string to the
// correct absolute instant; a datetime-local input displays local time to
// the viewer, so we read that instant back via the *local* getters here.
function formatApiDateTimeToInput(value) {
   const date = parseTenderApiDateTime(value);

   if (!date) {
      return '';
   }

   const year = date.getFullYear();
   const month = padDatePart(date.getMonth() + 1);
   const day = padDatePart(date.getDate());
   const hours = padDatePart(date.getHours());
   const minutes = padDatePart(date.getMinutes());

   return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// A datetime-local input's value (e.g. "2026-09-08T19:00") has no timezone
// designator, so `new Date(value)` correctly parses it as the viewer's
// local time, giving the correct absolute instant. From there,
// formatDateToTenderApiDateTime re-expresses that instant as Asia/Almaty
// wall-clock time — what the backend actually validates against — mirroring
// CreateTenderModal.jsx's formatDateTimeForTenderApi.
function formatInputDateTimeToApi(value) {
   if (!value) {
      return '';
   }

   return formatDateToTenderApiDateTime(new Date(value));
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

      return Object.values(value)
         .filter((item) => typeof item === 'string' && item.trim())
         .join(', ');
   }

   return '';
}

function normalizeNumber(value) {
   if (value === '' || value === null || value === undefined) {
      return null;
   }

   const numberValue = Number(value);

   return Number.isNaN(numberValue) ? null : numberValue;
}

function normalizeCurrency(value) {
   const currency = normalizeText(value).toUpperCase();

   return currency || 'KZT';
}

export function createTenderEditForm(tender) {
   if (!tender) {
      return {
         endDateTime: '',
         publicationType: 'public',
         maxParticipants: 0,

         from_location: '',
         to_location: '',

         cargos: [],

         summ: '',
         currency: 'KZT',
         vat: 'без НДС',
      };
   }

   const lead = tender.lead || {};

   return {
      endDateTime: formatApiDateTimeToInput(
         tender.end_date_time || tender.endDateTime,
      ),
      publicationType: tender.publication_type || 'public',
      maxParticipants: tender.max_participants ?? 0,

      from_location: normalizeLocationValue(lead.from_location),
      to_location: normalizeLocationValue(lead.to_location),

      cargos: Array.isArray(lead.cargos) ? lead.cargos : [],

      summ: lead.summ ?? '',
      currency: normalizeCurrency(lead.currency),
      vat: lead.vat || 'без НДС',
   };
}

export function mapTenderEditFormToApi(editForm, currentTender) {
   const payload = {};

   const nextEndDateTime = formatInputDateTimeToApi(editForm.endDateTime);
   const currentEndDateTime =
      currentTender.end_date_time || currentTender.endDateTime || '';

   if (nextEndDateTime && nextEndDateTime !== currentEndDateTime) {
      payload.end_date_time = nextEndDateTime;
   }

   const nextPublicationType = editForm.publicationType || 'public';
   const currentPublicationType = currentTender.publication_type || 'public';

   if (nextPublicationType !== currentPublicationType) {
      payload.publication_type = nextPublicationType;
   }

   const nextMaxParticipants =
      nextPublicationType === 'public'
         ? (normalizeNumber(editForm.maxParticipants) ?? 0)
         : 0;

   const currentMaxParticipants =
      normalizeNumber(currentTender.max_participants) ?? 0;

   if (nextMaxParticipants !== currentMaxParticipants) {
      payload.max_participants = nextMaxParticipants;
   }

   return payload;
}

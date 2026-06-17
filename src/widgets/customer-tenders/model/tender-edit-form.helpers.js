function formatApiDateTimeToInput(value) {
   if (!value || typeof value !== 'string') {
      return '';
   }

   return value.replace(' ', 'T').slice(0, 16);
}

function formatInputDateTimeToApi(value) {
   if (!value) {
      return '';
   }

   return `${value.replace('T', ' ')}:00`;
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

function normalizeNumber(value) {
   if (value === '' || value === null || value === undefined) {
      return null;
   }

   const numberValue = Number(value);

   return Number.isNaN(numberValue) ? null : numberValue;
}

const CURRENCIES = ['KZT', 'USD', 'EUR', 'RUB'];

function normalizeCurrency(value) {
   const currency = normalizeText(value).toUpperCase();

   return CURRENCIES.includes(currency) ? currency : 'KZT';
}

export function createTenderEditForm(tender) {
   if (!tender) {
      return {
         endDateTime: '',
         publicationType: 'public',
         maxParticipants: 0,

         from_location: '',
         to_location: '',

         cargoType: 'Не указан',
         weight_kg: '',
         summ: '',
         currency: 'KZT',
         vat: 'без НДС',
         cargoDescription: '',
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

      cargoType: lead.cargo?.type || 'Не указан',
      weight_kg: lead.cargo?.weight_kg ?? '',
      summ: lead.summ ?? '',
      currency: normalizeCurrency(lead.currency),
      vat: lead.vat || 'без НДС',
      cargoDescription:
         lead.cargo?.context ||
         lead.cargo?.comment ||
         lead.cargo?.description ||
         '',
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

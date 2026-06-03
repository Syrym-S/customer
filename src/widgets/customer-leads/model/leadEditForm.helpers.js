export function createLeadEditForm(lead) {
   if (!lead) {
      return {
         customer: '',
         from_location: '',
         to_location: '',
         cargoType: '',
         weight_kg: '',
         summ: '',
         currency: '',
         vat: '',
         cargoDescription: '',
         driver: '',
      };
   }

   return {
      customer: lead.customer || '',
      from_location: lead.from_location?.trim() || '',
      to_location: lead.to_location?.trim() || '',
      cargoType: lead.cargo?.type || '',
      weight_kg: lead.cargo?.weight_kg || '',
      summ: lead.summ || '',
      currency: lead.currency || '',
      vat: lead.vat || '',
      cargoDescription: lead.cargo?.description || '',
      driver: lead.driver || '',
   };
}

export function normalizeNumber(value) {
   if (value === '') {
      return value;
   }

   const numberValue = Number(value);

   return Number.isNaN(numberValue) ? value : numberValue;
}

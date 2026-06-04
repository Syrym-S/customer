const baseLead = {
   status: 'started',
   id: '6a0bf228b87b6aa6ad0445e2',
   num: 0,
   created_at: {
      date: '2026-05-19 05:16:24.059000',
      timezone_type: 3,
      timezone: 'UTC',
   },
   driver: 'Suleimenov Syrym',
   summ: 0,
   currency: 'KZT',
   transportation_price: 0,
   vat: 'с НДС',
   to_location: ' Казахстан, г Астана ',
   from_location: ' Казахстан, Павлодарская обл ',
   gsm: false,
   customer: 'AKE Plast (АКЕ Пласт) ТОО',

   route: {
      from: {
         lat: 52.2873,
         lng: 76.9674,
      },
      to: {
         lat: 51.1694,
         lng: 71.4491,
      },
   },

   cargo: {
      description: 'Груз заявки #33249585 Не указан',
      context: null,
      weight_kg: 0,
      type: 'Не указан',
      volume_cm: null,
   },
};

export const mockLeads = Array.from({ length: 60 }, (_, index) => ({
   ...baseLead,
   id: `${baseLead.id}-${index + 1}`,
   num: index + 1,
}));

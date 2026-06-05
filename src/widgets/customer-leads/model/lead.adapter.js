function mapForwarderFromLead(apiLead) {
   const forwarder =
      apiLead.forwarder ||
      apiLead.forwarder_data ||
      apiLead.expeditor ||
      apiLead.expediter ||
      null;

   return {
      id: forwarder?.id ?? apiLead.forwarder_id ?? null,

      fullName:
         forwarder?.fullName ??
         forwarder?.full_name ??
         forwarder?.fio ??
         forwarder?.name ??
         apiLead.forwarder_name ??
         'Не указан',

      companyName:
         forwarder?.companyName ??
         forwarder?.company_name ??
         forwarder?.company?.name ??
         forwarder?.organization?.name ??
         apiLead.forwarder_company_name ??
         '',

      companyBin:
         forwarder?.companyBin ??
         forwarder?.company_bin ??
         forwarder?.company?.bin ??
         forwarder?.organization?.bin ??
         apiLead.forwarder_company_bin ??
         '',

      phone:
         forwarder?.phone ??
         forwarder?.phone_number ??
         apiLead.forwarder_phone ??
         '',
   };
}

export function mapLeadFromApi(apiLead) {
   return {
      id: apiLead.id,
      num: apiLead.num ?? apiLead.id,

      customer:
         apiLead.customer?.name ||
         apiLead.customer ||
         apiLead.creator?.name ||
         'Без заказчика',

      forwarder: mapForwarderFromLead(apiLead),

      from_location:
         apiLead.from_location ||
         apiLead.route?.from?.address ||
         apiLead.route?.from?.city ||
         'Не указано',

      to_location:
         apiLead.to_location ||
         apiLead.route?.to?.address ||
         apiLead.route?.to?.city ||
         'Не указано',

      summ: apiLead.summ ?? apiLead.price ?? null,
      currency: apiLead.currency ?? 'KZT',

      status: apiLead.status || 'unknown',

      transportation_price: apiLead.transportation_price ?? null,
      vat: apiLead.vat ?? null,
      gsm: apiLead.gsm ?? false,
      created_at: apiLead.created_at ?? null,
      updated_at: apiLead.updated_at ?? null,

      cargo: {
         name: apiLead.cargo?.name ?? '',
         description: apiLead.cargo?.description ?? '',
         context: apiLead.cargo?.context ?? null,
         weight_kg: apiLead.cargo?.weight_kg ?? null,
         type: apiLead.cargo?.type ?? 'Не указан',
         volume_cm: apiLead.cargo?.volume_cm ?? null,
         width_cm: apiLead.cargo?.width_cm ?? null,
         height_cm: apiLead.cargo?.height_cm ?? null,
         length_cm: apiLead.cargo?.length_cm ?? null,
      },

      driver: apiLead.driver ?? 'Не назначен',

      creator: apiLead.creator ?? null,
      person: apiLead.person ?? null,
      files: apiLead.files ?? [],
      agreement: apiLead.agreement ?? null,
      geows: apiLead.geows ?? null,

      type_of_loading: apiLead.type_of_loading ?? 'Не указан',
      type_of_packaging: apiLead.type_of_packaging ?? 'Не указан',
      type_of_composition: apiLead.type_of_composition ?? 'Не указан',
      type_of_transport: apiLead.type_of_transport ?? 'Не указан',
      gos_number: apiLead.gos_number ?? null,

      raw: apiLead,
   };
}

export function mapLeadsResponseFromApi(response) {
   return {
      leads: Array.isArray(response.results)
         ? response.results.map(mapLeadFromApi)
         : [],
      page: response.page ?? 1,
      perPage: response.per_page ?? response.perPage ?? 4,
      count: response.count ?? 0,
   };
}

export function mapLeadDetailsResponseFromApi(response) {
   return response?.data ? mapLeadFromApi(response.data) : null;
}

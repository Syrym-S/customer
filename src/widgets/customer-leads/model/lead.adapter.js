function isBinLike(value) {
   return /^\d{12}$/.test(String(value ?? '').trim());
}

function getFileNameFromPath(value) {
   if (!value) return '';

   const cleanValue = String(value).split('?')[0].split('#')[0];
   const parts = cleanValue.split('/');

   return decodeURIComponent(parts[parts.length - 1] || '');
}

function normalizeCargoTypeValue(value) {
   if (!value) {
      return 'Не указан';
   }

   if (typeof value === 'string') {
      return value.trim() || 'Не указан';
   }

   if (typeof value === 'object') {
      return (
         value.name || value.title || value.label || value.type || 'Не указан'
      );
   }

   return String(value);
}

function normalizeApiPrice(value) {
   if (value === '' || value === null || value === undefined) {
      return null;
   }

   const number = Number(value);

   if (Number.isNaN(number)) {
      return null;
   }

   return number === 0 ? null : number;
}

function mapForwarderFromLead(apiLead) {
   const forwarder =
      apiLead.forwarder ||
      apiLead.forwarder_data ||
      apiLead.expeditor ||
      apiLead.expediter ||
      null;

   const rawCompanyName =
      forwarder?.companyName ??
      forwarder?.company_name ??
      forwarder?.company?.name ??
      forwarder?.organization?.name ??
      apiLead.forwarder_company_name ??
      '';

   const rawCompanyBin =
      forwarder?.companyBin ??
      forwarder?.company_bin ??
      forwarder?.company?.bin ??
      forwarder?.organization?.bin ??
      apiLead.forwarder_company_bin ??
      '';

   const fallbackName = forwarder?.name ?? '';
   const fallbackBin = forwarder?.bin ?? '';

   return {
      id: forwarder?.id ?? apiLead.forwarder_id ?? null,

      fullName:
         forwarder?.fullName ??
         forwarder?.full_name ??
         forwarder?.fio ??
         forwarder?.contact_person ??
         forwarder?.contactPerson ??
         forwarder?.person?.name ??
         apiLead.forwarder_name ??
         'Не указан',

      companyName:
         rawCompanyName ||
         (!isBinLike(fallbackName) ? fallbackName : '') ||
         (!isBinLike(fallbackBin) ? fallbackBin : '') ||
         '',

      companyBin:
         rawCompanyBin ||
         (isBinLike(fallbackBin) ? fallbackBin : '') ||
         (isBinLike(fallbackName) ? fallbackName : '') ||
         '',

      phone:
         forwarder?.phone ??
         forwarder?.phoneNumber ??
         forwarder?.phone_number ??
         forwarder?.tel ??
         apiLead.forwarder_phone ??
         '',
   };
}

function mapLeadFileFromApi(apiFile, index) {
   const fileNameFromUrl = getFileNameFromPath(apiFile.url);
   const fileNameFromPath = getFileNameFromPath(apiFile.path);

   const fileName =
      apiFile.file_name ||
      apiFile.fileName ||
      apiFile.original_name ||
      apiFile.originalName ||
      apiFile.filename ||
      apiFile.original_filename ||
      fileNameFromUrl ||
      fileNameFromPath ||
      `file-${index + 1}`;

   return {
      id: apiFile.path ?? apiFile.url ?? apiFile.id ?? `file-${index}`,
      name: apiFile.name ?? apiFile.title ?? 'Документ',
      context: apiFile.context ?? '',
      fileName,
      fileUrl: apiFile.url ?? apiFile.path ?? '#',
      fileType: apiFile.type ?? apiFile.mime_type ?? '',
      createdAt: apiFile.created_at ?? null,
      path: apiFile.path ?? '',
      source: apiFile.source ?? 'customer',
      raw: apiFile,
   };
}

export function mapLeadDocumentsResponseFromApi(response) {
   const files = Array.isArray(response)
      ? response
      : (response?.files ?? response?.data?.files ?? []);

   return Array.isArray(files) ? files.map(mapLeadFileFromApi) : [];
}

function mapLeadDocumentsFromApi(apiLead) {
   const files =
      apiLead.files ??
      apiLead.documents ??
      apiLead.docs ??
      apiLead.attachments ??
      [];

   if (!Array.isArray(files)) {
      return [];
   }

   return files.map(mapLeadFileFromApi);
}

function normalizeText(value) {
   if (value === null || value === undefined) {
      return '';
   }

   return String(value).trim();
}

function getCargoDescription(apiCargo) {
   return apiCargo?.context ?? apiCargo?.comment ?? apiCargo?.description ?? '';
}

function normalizeCargoFromApi(apiCargo = {}) {
   const type = normalizeCargoTypeValue(apiCargo.type);
   const name = normalizeText(apiCargo.name) || type || 'Не указан';
   const description = getCargoDescription(apiCargo);

   return {
      id: apiCargo.id ?? null,
      name,
      description,
      context: description,
      rawDescription: apiCargo.description ?? '',

      weight_kg: apiCargo.weight_kg ?? null,
      cargo_price: apiCargo.cargo_price ?? null,

      type,

      volume_cm: apiCargo.volume_cm ?? null,
      width_cm: apiCargo.width_cm ?? null,
      height_cm: apiCargo.height_cm ?? null,
      length_cm: apiCargo.length_cm ?? null,

      raw: apiCargo,
   };
}

function mapLeadCargosFromApi(apiLead) {
   if (!Array.isArray(apiLead.cargos)) {
      return [];
   }

   return apiLead.cargos.map((cargo) => normalizeCargoFromApi(cargo));
}

export function mapLeadFromApi(apiLead) {
   const cargos = mapLeadCargosFromApi(apiLead);
   const price = normalizeApiPrice(apiLead.price);
   const firstCargo = cargos[0];

   return {
      id: apiLead.id,
      num: apiLead.num ?? apiLead.id,

      created_by: apiLead.created_by || '',

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

      price,
      summ: price,
      currency: apiLead.currency ?? 'KZT',

      status: apiLead.status || 'unknown',

      transportation_price: apiLead.transportation_price ?? null,
      vat: apiLead.vat ?? null,
      gsm: apiLead.gsm ?? false,
      created_at: apiLead.created_at ?? null,
      updated_at: apiLead.updated_at ?? null,

      cargo: firstCargo,
      cargos,

      driver: apiLead.driver ?? 'Не назначен',

      creator: apiLead.creator ?? null,
      person: apiLead.person ?? null,
      files: apiLead.files ?? [],
      documents: mapLeadDocumentsFromApi(apiLead),
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

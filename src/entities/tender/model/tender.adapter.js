function formatTenderLocation(location) {
   if (!location) {
      return '';
   }

   if (typeof location === 'string') {
      return location.trim();
   }

   if (typeof location !== 'object') {
      return String(location);
   }

   if (location.address) {
      return String(location.address).trim();
   }

   const parts = [location.country, location.region, location.city].filter(
      Boolean,
   );

   if (parts.length) {
      return parts.join(', ');
   }

   const lat = location.lat ?? location.latitude;
   const lon = location.lon ?? location.lng ?? location.longitude;

   if (lat && lon) {
      return `${lat}, ${lon}`;
   }

   return '';
}

function normalizeTenderLocationFromApi(location) {
   if (!location) {
      return '';
   }

   if (typeof location === 'string') {
      const label = location.trim();

      return {
         country: '',
         region: '',
         city: '',
         address: label,
         label,
         lat: null,
         lon: null,
         lng: null,
      };
   }

   if (typeof location !== 'object') {
      const label = String(location);

      return {
         country: '',
         region: '',
         city: '',
         address: label,
         label,
         lat: null,
         lon: null,
         lng: null,
      };
   }

   const lat = location.lat ?? location.latitude ?? null;
   const lon = location.lon ?? location.lng ?? location.longitude ?? null;
   const label = formatTenderLocation(location);

   return {
      ...location,
      country: location.country ?? '',
      region: location.region ?? '',
      city: location.city ?? '',
      address: location.address || label,
      label,
      lat,
      lon,
      lng: lon,
   };
}

function normalizeTenderWaypointFromApi(waypoint = {}, index) {
   const normalizedLocation = normalizeTenderLocationFromApi(waypoint);

   return {
      ...normalizedLocation,
      id: waypoint.id ?? `waypoint-${index}`,
      raw: waypoint,
   };
}

function normalizeTenderWaypointsFromApi(waypoints) {
   if (!Array.isArray(waypoints)) {
      return [];
   }

   return waypoints.map(normalizeTenderWaypointFromApi);
}

function normalizeTenderCargoFromApi(cargo = {}) {
   const description =
      cargo.description ?? cargo.context ?? cargo.comment ?? '';

   return {
      id: cargo.id ?? null,
      name: cargo.name || cargo.type || 'Не указан',
      description,
      context: description,
      weight_kg: cargo.weight_kg ?? null,
      cargo_price: cargo.cargo_price ?? null,
      type: cargo.type || 'Не указан',
      width_cm: cargo.width_cm ?? null,
      height_cm: cargo.height_cm ?? null,
      length_cm: cargo.length_cm ?? null,
      raw: cargo,
   };
}

function mapTenderLeadCargosFromApi(lead) {
   if (!Array.isArray(lead?.cargos)) {
      return [];
   }

   return lead.cargos.map(normalizeTenderCargoFromApi);
}

function mapTenderLeadFromApi(lead) {
   if (!lead) {
      return null;
   }

   const documents = mapTenderLeadDocumentsFromApi(lead);
   const cargos = mapTenderLeadCargosFromApi(lead);

   const fromLocation = normalizeTenderLocationFromApi(lead.from_location);
   const toLocation = normalizeTenderLocationFromApi(lead.to_location);
   const waypoints = normalizeTenderWaypointsFromApi(lead.waypoints);

   return {
      ...lead,

      from_location: fromLocation,
      to_location: toLocation,
      waypoints,

      fromLocationLabel: formatTenderLocation(fromLocation),
      toLocationLabel: formatTenderLocation(toLocation),

      cargos,
      documents,
      files: documents,
   };
}

export function mapTenderFromApi(tender) {
   if (!tender) {
      return null;
   }

   const lead = mapTenderLeadFromApi(tender.lead);

   return {
      id: tender.id,
      status: tender.status || 'new',
      type: tender.type || 'forwarder',
      publication_type: tender.publication_type || 'public',

      public_date_time: tender.public_date_time || '',
      end_date_time: tender.end_date_time || '',
      endDateTime: tender.end_date_time || '',

      max_participants: tender.max_participants ?? 0,
      lead_id: tender.lead_id || lead?.id || '',

      participants_count: tender.participants_count ?? 0,
      bets_count: tender.bets_count ?? 0,

      lead,

      from_location: lead?.fromLocationLabel || '',
      to_location: lead?.toLocationLabel || '',
      waypoints: lead?.waypoints || [],

      cargos: lead?.cargos || [],
      summ: lead?.summ ?? null,
      currency: lead?.currency || 'KZT',
      vat: lead?.vat || '',

      participants: Array.isArray(tender.participants)
         ? tender.participants
         : [],

      bets: Array.isArray(tender.bets) ? tender.bets : [],
   };
}

export function mapTendersListFromApi(response) {
   const items = Array.isArray(response?.data) ? response.data : [];

   return {
      tenders: items.map(mapTenderFromApi).filter(Boolean),
      count: response?.total ?? 0,
      page: response?.page ?? 1,
      perPage: response?.limit ?? 10,
   };
}

function getShortLeadId(id) {
   if (!id) {
      return '';
   }

   return String(id).slice(-6);
}

export function mapTenderLeadSearchItemFromApi(item) {
   const from = item.from || '';
   const to = item.to || '';
   const cargo = item.cargo || 'Груз не указан';
   const shortId = getShortLeadId(item.id);

   const title =
      from && to
         ? `${from} → ${to}`
         : to
           ? `Куда: ${to}`
           : from
             ? `Откуда: ${from}`
             : `Лид #${shortId || item.id}`;

   return {
      id: item.id,
      status: item.status || '',
      forwarder: item.forwarder || '',
      from,
      to,
      cargo,
      price: item.price ?? null,
      createdAt: item.created_at || '',

      title,
      label: title,
      subtitle: [cargo, item.forwarder ? `Экспедитор: ${item.forwarder}` : '']
         .filter(Boolean)
         .join(' • '),
   };
}

export function mapTenderLeadsSearchFromApi(response) {
   const results = Array.isArray(response?.results) ? response.results : [];

   return {
      results: results.map(mapTenderLeadSearchItemFromApi),
      total: response?.total ?? 0,
      page: response?.page ?? 1,
      perPage: response?.per_page ?? 10,
   };
}

function getFileNameFromPath(path) {
   if (!path || typeof path !== 'string') {
      return '';
   }

   const cleanPath = path.split('?')[0];
   const parts = cleanPath.split('/');

   return parts[parts.length - 1] || '';
}

function mapTenderLeadFileFromApi(apiFile, index) {
   const sourceUrl = apiFile.fileUrl || apiFile.url || '';
   const sourcePath = apiFile.path || '';

   const fileNameFromUrl = getFileNameFromPath(sourceUrl);
   const fileNameFromPath = getFileNameFromPath(sourcePath);

   const fileName =
      apiFile.file_name ||
      apiFile.fileName ||
      apiFile.original_name ||
      apiFile.originalName ||
      apiFile.filename ||
      apiFile.original_filename ||
      apiFile.name ||
      fileNameFromUrl ||
      fileNameFromPath ||
      `file-${index + 1}`;

   return {
      id:
         apiFile.id ||
         apiFile.path ||
         apiFile.fileUrl ||
         apiFile.url ||
         `file-${index}`,
      name: apiFile.name || apiFile.title || fileName || 'Документ',
      context: apiFile.context || '',
      fileName,
      fileUrl: sourceUrl || sourcePath || '#',
      fileType: apiFile.fileType || apiFile.type || apiFile.mime_type || '',
      createdAt: apiFile.createdAt || apiFile.created_at || null,
      path: sourcePath,
      source: apiFile.source || 'customer',
      raw: apiFile.raw || apiFile,
   };
}

export function mapTenderLeadDocumentsResponseFromApi(response) {
   const files = Array.isArray(response)
      ? response
      : (response?.files ?? response?.data?.files ?? []);

   return Array.isArray(files) ? files.map(mapTenderLeadFileFromApi) : [];
}

function mapTenderLeadDocumentsFromApi(apiLead) {
   const files =
      apiLead.files ??
      apiLead.documents ??
      apiLead.docs ??
      apiLead.attachments ??
      [];

   if (!Array.isArray(files)) {
      return [];
   }

   return files.map(mapTenderLeadFileFromApi);
}

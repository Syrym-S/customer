function hasValue(value) {
    return value !== null && value !== undefined && value !== '';
}

function toNumber(value) {
    if (!hasValue(value)) {
        return null;
    }

    const number = Number(value);

    return Number.isNaN(number) ? null : number;
}

function addIfHasValue(target, key, value) {
    if (hasValue(value)) {
        target[key] = value;
    }
}

function addNumberIfHasValue(target, key, value) {
    const number = toNumber(value);

    if (number !== null) {
        target[key] = number;
    }
}

function normalizeText(value) {
    return String(value ?? '').trim();
}

function getLocationPayloadValue(location, field, fallback) {
    if (!location || typeof location !== 'object') {
        return fallback;
    }

    return normalizeText(location[field]) || fallback;
}

function normalizeCargoTypeValue(value) {
    const normalizedValue = normalizeText(value);

    if (!normalizedValue || normalizedValue === 'Не указан') {
        return '';
    }

    return normalizedValue;
}

function mapFormCargoToApiCargo(cargo = {}) {
    const type = normalizeCargoTypeValue(cargo.type ?? cargo.cargoType);
    const name = normalizeText(cargo.name ?? cargo.cargoName);
    const description = normalizeText(
        cargo.description ?? cargo.comment ?? cargo.context,
    );

    const payload = {};

    addIfHasValue(payload, 'name', name || type);
    addIfHasValue(payload, 'description', description || null);

    addNumberIfHasValue(payload, 'weight_kg', cargo.weight_kg);
    addNumberIfHasValue(payload, 'cargo_price', cargo.cargo_price);
    addIfHasValue(payload, 'type', type);
    addNumberIfHasValue(payload, 'width_cm', cargo.width_cm);
    addNumberIfHasValue(payload, 'height_cm', cargo.height_cm);
    addNumberIfHasValue(payload, 'length_cm', cargo.length_cm);

    return payload;
}

function getNormalizedFormCargos(form) {
    const sourceCargos = Array.isArray(form.cargos) ? form.cargos : [];

    return sourceCargos
        .map(mapFormCargoToApiCargo)
        .filter((cargo) =>
            Object.values(cargo).some((value) => hasValue(value)),
        );
}

function mapApiCargoToUiCargo(cargo) {
    const type = normalizeCargoTypeValue(cargo.type) || 'Не указан';
    const name = normalizeText(cargo.name) || type;

    return {
        name,
        description: cargo.description || '',
        context: cargo.description || '',
        weight_kg: cargo.weight_kg ?? 0,
        type,
        volume_cm: null,
        width_cm: cargo.width_cm ?? null,
        height_cm: cargo.height_cm ?? null,
        length_cm: cargo.length_cm ?? null,
    };
}

export function mapCreateLeadFormToApi(form) {
    const fromLocation = normalizeText(form.fromLocation);
    const toLocation = normalizeText(form.toLocation);

    const payload = {
        from_country: getLocationPayloadValue(
            form.from_location,
            'country',
            fromLocation,
        ),
        from_region: getLocationPayloadValue(
            form.from_location,
            'region',
            fromLocation,
        ),
        from_city: getLocationPayloadValue(
            form.from_location,
            'city',
            fromLocation,
        ),
        from_address: form.from_location.address,

        to_country: getLocationPayloadValue(
            form.to_location,
            'country',
            toLocation,
        ),
        to_region: getLocationPayloadValue(
            form.to_location,
            'region',
            toLocation,
        ),
        to_city: getLocationPayloadValue(form.to_location, 'city', toLocation),
        to_address: form.to_location.address,

        currency: form.currency || 'KZT',
        vat: form.vat ? 'с НДС' : 'без НДС',
    };

    addIfHasValue(payload, 'forwarder', form.forwarderId);

    addIfHasValue(payload, 'loading_date', form.loadingDate);
    addIfHasValue(payload, 'comment', normalizeText(form.comment));

    addNumberIfHasValue(payload, 'from_lat', form.fromLat);
    addNumberIfHasValue(payload, 'from_lon', form.fromLng);
    addNumberIfHasValue(payload, 'to_lat', form.toLat);
    addNumberIfHasValue(payload, 'to_lon', form.toLng);

    const cargos = getNormalizedFormCargos(form);

    if (cargos.length) {
        payload.cargos = cargos;
    }

    addNumberIfHasValue(payload, 'price', form.price);

    return payload;
}

export function mapCreateLeadDocumentsToApiDocuments(form) {
    return (form.documents || [])
        .filter((document) => document.file)
        .map((document) => ({
            name: document.name || document.fileName || 'Документ',
            context: document.context || '',
            file: document.file,
        }));
}

export function mapCreatedLeadToUi(form, response) {
    const responseData = response?.data ?? response ?? {};
    const id =
        responseData?.id ??
        responseData?.lead_id ??
        `created-lead-${Date.now()}`;

    const cargos = getNormalizedFormCargos(form).map(mapApiCargoToUiCargo);

    const fallbackCargo = {
        name: 'Не указан',
        description: '',
        context: '',
        weight_kg: 0,
        type: 'Не указан',
        volume_cm: null,
        width_cm: null,
        height_cm: null,
        length_cm: null,
    };

    const firstCargo = cargos[0] ?? fallbackCargo;

    return {
        id,
        num: responseData?.num ?? id,

        customer:
            responseData?.customer?.name ||
            responseData?.customer ||
            responseData?.creator?.name ||
            'Текущий заказчик',

        forwarder: form.forwarder ?? {
            id: form.forwarderId || null,
            fullName: 'Не указан',
            companyName: '',
            companyBin: '',
            phone: '',
        },

        from_location: form.fromLocation || 'Не указано',
        to_location: form.toLocation || 'Не указано',

        summ: Number(form.price) || 0,
        currency: form.currency || 'KZT',

        status: responseData?.status || 'new',

        transportation_price: null,
        vat: form.vat ? 'с НДС' : 'без НДС',
        gsm: false,
        created_at: responseData?.created_at ?? null,
        updated_at: null,

        cargo: firstCargo,
        cargos,

        driver: 'Не назначен',

        creator: null,
        person: null,
        files: [],
        agreement: null,
        geows: null,

        type_of_loading: 'Не указан',
        type_of_packaging: 'Не указан',
        type_of_composition: 'Не указан',
        type_of_transport: 'Не указан',
        gos_number: null,

        raw: {
            ...responseData,
            cargos,
            cargo: firstCargo,
            route: {
                from: {
                    lat: form.fromLat ? Number(form.fromLat) : null,
                    lng: form.fromLng ? Number(form.fromLng) : null,
                },
                to: {
                    lat: form.toLat ? Number(form.toLat) : null,
                    lng: form.toLng ? Number(form.toLng) : null,
                },
            },
        },
    };
}

export function formatCoordinatesLabel(lat, lng) {
    return `Координаты: ${lat}, ${lng}`;
}

function normalizeText(value) {
    return String(value ?? '').trim();
}

function getUniqueParts(parts) {
    return [...new Set(parts.map(normalizeText).filter(Boolean))];
}

export function formatNominatimAddress(data) {
    const address = data?.address || {};

    const country = normalizeText(address.country);

    const region = normalizeText(
        address.city_district ||
            address.state_district ||
            address.county ||
            address.state ||
            address.region,
    );

    const city = normalizeText(
        address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            address.county ||
            address.state_district,
    );

    const fullAddress = normalizeText(data?.display_name);

    const compactAddress = getUniqueParts([
        city,
        region,
        address.state,
        country,
    ]).join(', ');

    return {
        country,
        region,
        city,
        address: fullAddress || compactAddress || 'Адрес не найден',
        label: compactAddress || fullAddress || 'Адрес не найден',
    };
}

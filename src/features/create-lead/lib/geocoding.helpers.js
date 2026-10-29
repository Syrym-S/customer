import i18n from '../../../shared/i18n';

export function formatCoordinatesLabel(lat, lng) {
    return i18n.t("route.coordinates", { lat: lat, lng: lng });
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

    const displayAddress = fullAddress || compactAddress || i18n.t("route.addressNotFound");

    return {
        country,
        region,
        city,
        address: displayAddress,
        label: displayAddress,
        compactLabel: compactAddress || displayAddress,
    };
}

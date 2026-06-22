import {
    formatCoordinatesLabel,
    formatNominatimAddress,
} from '../lib/geocoding.helpers';

export async function reverseGeocode(lat, lng, options = {}) {
    try {
        const url = new URL('https://nominatim.openstreetmap.org/reverse');

        url.searchParams.set('format', 'jsonv2');
        url.searchParams.set('lat', lat);
        url.searchParams.set('lon', lng);
        url.searchParams.set('addressdetails', '1');
        url.searchParams.set('accept-language', 'ru');

        const response = await fetch(url.toString(), {
            signal: options.signal,
        });

        if (!response.ok) {
            throw new Error('Reverse geocoding failed');
        }

        const data = await response.json();

        return formatNominatimAddress(data);
    } catch (error) {
        if (error.name === 'AbortError') {
            throw error;
        }

        console.error(error);

        const fallbackAddress = formatCoordinatesLabel(lat, lng);

        return {
            country: '',
            region: '',
            city: '',
            address: fallbackAddress,
            label: fallbackAddress,
        };
    }
}

export async function searchGeocode(query, options = {}) {
    const trimmedQuery = String(query ?? '').trim();

    if (trimmedQuery.length < 2) {
        return [];
    }

    const url = new URL('https://nominatim.openstreetmap.org/search');

    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('q', trimmedQuery);
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('limit', '8');
    url.searchParams.set('accept-language', 'ru');

    const response = await fetch(url.toString(), {
        signal: options.signal,
    });

    if (!response.ok) {
        throw new Error('Geocoding search failed');
    }

    const data = await response.json();

    return data
        .map((item) => {
            const location = formatNominatimAddress(item);

            return {
                ...location,
                lat: Number(item.lat),
                lng: Number(item.lon),
            };
        })
        .filter(
            (item) => Number.isFinite(item.lat) && Number.isFinite(item.lng),
        );
}

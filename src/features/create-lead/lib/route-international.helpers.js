const kazakhstanNames = new Set([
    'kz',
    'kaz',
    'kazakhstan',
    'republic of kazakhstan',
    'казахстан',
    'республика казахстан',
    'қазақстан',
    'қазақстан республикасы',
]);

export function isInternationalRoute(form = {}) {
    const points = [
        form.from_location,
        ...(form.waypoints || []).map((waypoint) => waypoint.location_data),
        form.to_location,
    ];

    return points.some((point) => {
        const country = String(point?.country ?? '')
            .trim()
            .toLowerCase();

        return country !== '' && !kazakhstanNames.has(country);
    });
}

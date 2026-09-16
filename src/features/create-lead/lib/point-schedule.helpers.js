export function getFormFieldValue(form, fieldPath) {
    return fieldPath
        .split('.')
        .reduce((value, key) => (value == null ? value : value[key]), form);
}

export function buildPointScheduleFields(waypoints) {
    return [
        { startField: 'fromStartAt', endField: 'fromEndAt' },
        ...waypoints.map((_, index) => ({
            startField: `waypoints.${index}.startAt`,
            endField: `waypoints.${index}.endAt`,
        })),
        { startField: 'toStartAt', endField: 'toEndAt' },
    ];
}

function normalizeScheduleDate(value) {
    return typeof value === 'string' && value.trim() ? value.trim() : '';
}

export function buildPointSchedulesPayload(form) {
    const waypoints = Array.isArray(form.waypoints) ? form.waypoints : [];
    const points = buildPointScheduleFields(waypoints);

    return points
        .map((point, index) => {
            const schedule = { point_index: index };

            const startAt = normalizeScheduleDate(
                getFormFieldValue(form, point.startField),
            );
            const endAt = normalizeScheduleDate(
                getFormFieldValue(form, point.endField),
            );

            if (startAt) {
                schedule.start_at = startAt;
            }

            if (endAt) {
                schedule.end_at = endAt;
            }

            return schedule;
        })
        .filter((schedule) => schedule.start_at || schedule.end_at);
}

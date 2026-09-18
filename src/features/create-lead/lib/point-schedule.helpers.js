import { formatDateToTenderApiDateTime } from '../../../widgets/customer-tenders/model/tender.helpers';

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

export function hasWaypointCoordinates(waypoint) {
    return (
        waypoint?.lat !== '' &&
        waypoint?.lat !== null &&
        waypoint?.lat !== undefined &&
        waypoint?.lng !== '' &&
        waypoint?.lng !== null &&
        waypoint?.lng !== undefined
    );
}

export function getPointScheduleIndex(pointScheduleFields, fieldName, role) {
    return pointScheduleFields.findIndex((point) => point[role] === fieldName);
}

export function getStartAtMin(form, pointScheduleFields, fieldName) {
    const pointIndex = getPointScheduleIndex(
        pointScheduleFields,
        fieldName,
        'startField',
    );

    if (pointIndex <= 0) {
        return undefined;
    }

    const previousEndField = pointScheduleFields[pointIndex - 1].endField;

    return getFormFieldValue(form, previousEndField) || undefined;
}

export function getEndAtMin(form, pointScheduleFields, fieldName) {
    const pointIndex = getPointScheduleIndex(
        pointScheduleFields,
        fieldName,
        'endField',
    );

    if (pointIndex === -1) {
        return undefined;
    }

    const ownStartField = pointScheduleFields[pointIndex].startField;

    return getFormFieldValue(form, ownStartField) || undefined;
}

export function getTodayDateInputValue() {
    return formatDateToTenderApiDateTime(new Date()).split(' ')[0];
}

export function validateNotBeforeToday(value) {
    if (!value) {
        return true;
    }

    return (
        value >= getTodayDateInputValue() ||
        'Дата не может быть раньше сегодняшнего дня'
    );
}

export function validateStartAtChain(form, pointScheduleFields, fieldName) {
    return (value) => {
        const pointIndex = getPointScheduleIndex(
            pointScheduleFields,
            fieldName,
            'startField',
        );

        if (pointIndex <= 0) {
            return true;
        }

        const previousEndField = pointScheduleFields[pointIndex - 1].endField;
        const previousEndValue = getFormFieldValue(form, previousEndField);

        if (!previousEndValue || !value) {
            return true;
        }

        return (
            value >= previousEndValue ||
            'Дата начала не может быть раньше даты окончания предыдущей точки'
        );
    };
}

export function validateEndAtOwnStart(form, pointScheduleFields, fieldName) {
    return (value) => {
        const pointIndex = getPointScheduleIndex(
            pointScheduleFields,
            fieldName,
            'endField',
        );

        if (pointIndex === -1) {
            return true;
        }

        const ownStartField = pointScheduleFields[pointIndex].startField;
        const ownStartValue = getFormFieldValue(form, ownStartField);

        if (!ownStartValue || !value) {
            return true;
        }

        return (
            value >= ownStartValue ||
            'Дата окончания не может быть раньше даты начала этой точки'
        );
    };
}

export function getPointScheduleFieldOrder(pointScheduleFields) {
    return pointScheduleFields.flatMap((point) => [
        point.startField,
        point.endField,
    ]);
}

export function isDateFieldDisabled(form, pointScheduleFields, fieldName) {
    const fieldOrder = getPointScheduleFieldOrder(pointScheduleFields);
    const fieldIndex = fieldOrder.indexOf(fieldName);

    if (fieldIndex <= 0) {
        return false;
    }

    return fieldOrder
        .slice(0, fieldIndex)
        .some((precedingField) => !getFormFieldValue(form, precedingField));
}

export function getStartAtChangeDependentField(pointScheduleFields, fieldName) {
    const pointIndex = getPointScheduleIndex(
        pointScheduleFields,
        fieldName,
        'startField',
    );

    return pointIndex !== -1 ? pointScheduleFields[pointIndex].endField : null;
}

export function getEndAtChangeDependentField(pointScheduleFields, fieldName) {
    const pointIndex = getPointScheduleIndex(
        pointScheduleFields,
        fieldName,
        'endField',
    );

    return pointIndex !== -1 && pointScheduleFields[pointIndex + 1]
        ? pointScheduleFields[pointIndex + 1].startField
        : null;
}

export function getPointScheduleByIndex(pointSchedules, pointIndex) {
    if (!Array.isArray(pointSchedules)) {
        return null;
    }

    return (
        pointSchedules.find(
            (schedule) => schedule?.point_index === pointIndex,
        ) || null
    );
}

export function getScheduleDateOnly(value) {
    if (!value || typeof value !== 'string') {
        return '';
    }

    return value.split(' ')[0];
}

function normalizePointScheduleForCompare(schedule) {
    return {
        point_index: schedule?.point_index ?? null,
        start_at: getScheduleDateOnly(schedule?.start_at) || null,
        end_at: getScheduleDateOnly(schedule?.end_at) || null,
    };
}

export function havePointSchedulesChanged(nextSchedules, currentSchedules) {
    const next = (Array.isArray(nextSchedules) ? nextSchedules : [])
        .map(normalizePointScheduleForCompare)
        .sort((a, b) => a.point_index - b.point_index);

    const current = (Array.isArray(currentSchedules) ? currentSchedules : [])
        .map(normalizePointScheduleForCompare)
        .sort((a, b) => a.point_index - b.point_index);

    return JSON.stringify(next) !== JSON.stringify(current);
}

import { useRef, useState } from 'react';

import { reverseGeocode } from '../api/geocoding.api';
import { formatCoordinatesLabel } from '../lib/geocoding.helpers';
import {
    getRouteMarkers,
    getRoutePoints,
    hasPoint,
} from '../lib/route-map.helpers';

const setValueOptions = {
    shouldDirty: true,
    shouldTouch: true,
    shouldValidate: true,
};

const emptyLocation = {
    country: '',
    region: '',
    city: '',
    address: '',
    label: '',
};

function createEmptyWaypoint() {
    return {
        id: `waypoint-${Date.now()}-${Math.random()}`,
        location: '',
        lat: '',
        lng: '',
        location_data: emptyLocation,
    };
}

function getWaypoints(form) {
    return Array.isArray(form.waypoints) ? form.waypoints : [];
}

function getWaypointPointKey(index) {
    return `waypoint-${index}`;
}

function isWaypointPoint(point) {
    return /^waypoint-\d+$/.test(String(point));
}

function getWaypointIndex(point) {
    return Number(String(point).replace('waypoint-', ''));
}

function getLocationLabel(location) {
    return location?.address || location?.label || '';
}

function createFallbackLocation(lat, lng) {
    const label = formatCoordinatesLabel(lat, lng);

    return {
        country: '',
        region: '',
        city: '',
        address: label,
        label,
    };
}

export function useRouteMapPicker({ form, setValue }) {
    const [activeMapPoint, setActiveMapPoint] = useState('from');
    const [loadingPoints, setLoadingPoints] = useState({
        from: false,
        to: false,
    });

    const reverseGeocodeControllersRef = useRef({
        from: null,
        to: null,
    });

    const routeMarkers = getRouteMarkers(form);
    const routePoints = getRoutePoints(form);

    function setPointLoading(point, isLoading) {
        setLoadingPoints((prevLoadingPoints) => ({
            ...prevLoadingPoints,
            [point]: isLoading,
        }));
    }

    function abortReverseGeocode(point) {
        if (reverseGeocodeControllersRef.current[point]) {
            reverseGeocodeControllersRef.current[point].abort();
            reverseGeocodeControllersRef.current[point] = null;
        }
    }

    async function getAddressForPoint(point, lat, lng) {
        abortReverseGeocode(point);

        const controller = new AbortController();

        reverseGeocodeControllersRef.current[point] = controller;
        setPointLoading(point, true);

        try {
            const address = await reverseGeocode(lat, lng, {
                signal: controller.signal,
            });

            if (reverseGeocodeControllersRef.current[point] !== controller) {
                return null;
            }

            return address;
        } catch (error) {
            if (error.name === 'AbortError') {
                return null;
            }

            console.error(error);

            return createFallbackLocation(lat, lng);
        } finally {
            if (reverseGeocodeControllersRef.current[point] === controller) {
                reverseGeocodeControllersRef.current[point] = null;
                setPointLoading(point, false);
            }
        }
    }

    async function setFromPoint(lat, lng) {
        setValue('fromLat', lat, setValueOptions);
        setValue('fromLng', lng, setValueOptions);
        setValue('fromLocation', 'Определяем адрес...', setValueOptions);
        setValue('from_location', emptyLocation, setValueOptions);

        const geocodeResult = await getAddressForPoint('from', lat, lng);

        if (!geocodeResult) {
            return;
        }

        setValue(
            'fromLocation',
            getLocationLabel(geocodeResult),
            setValueOptions,
        );
        setValue('from_location', geocodeResult, setValueOptions);
    }

    async function setToPoint(lat, lng) {
        setValue('toLat', lat, setValueOptions);
        setValue('toLng', lng, setValueOptions);
        setValue('toLocation', 'Определяем адрес...', setValueOptions);
        setValue('to_location', emptyLocation, setValueOptions);

        const geocodeResult = await getAddressForPoint('to', lat, lng);

        if (!geocodeResult) {
            return;
        }

        setValue(
            'toLocation',
            getLocationLabel(geocodeResult),
            setValueOptions,
        );
        setValue('to_location', geocodeResult, setValueOptions);
    }

    async function setWaypointPoint(index, lat, lng) {
        const pointKey = getWaypointPointKey(index);

        setValue(`waypoints.${index}.lat`, lat, setValueOptions);
        setValue(`waypoints.${index}.lng`, lng, setValueOptions);
        setValue(
            `waypoints.${index}.location`,
            'Определяем адрес...',
            setValueOptions,
        );
        setValue(
            `waypoints.${index}.location_data`,
            emptyLocation,
            setValueOptions,
        );

        const geocodeResult = await getAddressForPoint(pointKey, lat, lng);

        if (!geocodeResult) {
            return;
        }

        setValue(
            `waypoints.${index}.location`,
            getLocationLabel(geocodeResult),
            setValueOptions,
        );
        setValue(
            `waypoints.${index}.location_data`,
            geocodeResult,
            setValueOptions,
        );
    }

    function setSelectedLocationPoint(point, location) {
        if (!location?.lat || !location?.lng) {
            return;
        }

        const lat = Number(location.lat);
        const lng = Number(location.lng);

        const locationDetails = {
            country: location.country || '',
            region: location.region || '',
            city: location.city || '',
            address: location.address || location.label || '',
            label: location.address || location.label || '',
        };

        if (point === 'from') {
            setValue('fromLat', lat, setValueOptions);
            setValue('fromLng', lng, setValueOptions);
            setValue(
                'fromLocation',
                getLocationLabel(locationDetails),
                setValueOptions,
            );
            setValue('from_location', locationDetails, setValueOptions);
            setActiveMapPoint('to');
            return;
        }

        if (point === 'to') {
            setValue('toLat', lat, setValueOptions);
            setValue('toLng', lng, setValueOptions);
            setValue(
                'toLocation',
                getLocationLabel(locationDetails),
                setValueOptions,
            );
            setValue('to_location', locationDetails, setValueOptions);
            return;
        }

        if (isWaypointPoint(point)) {
            const index = getWaypointIndex(point);

            setValue(`waypoints.${index}.lat`, lat, setValueOptions);
            setValue(`waypoints.${index}.lng`, lng, setValueOptions);
            setValue(
                `waypoints.${index}.location`,
                getLocationLabel(locationDetails),
                setValueOptions,
            );
            setValue(
                `waypoints.${index}.location_data`,
                locationDetails,
                setValueOptions,
            );
        }
    }

    function handleRouteMapClick(latlng) {
        const lat = Number(latlng.lat.toFixed(6));
        const lng = Number(latlng.lng.toFixed(6));

        if (activeMapPoint === 'from') {
            setFromPoint(lat, lng);

            const waypoints = getWaypoints(form);
            setActiveMapPoint(waypoints.length ? 'waypoint-0' : 'to');
            return;
        }

        if (activeMapPoint === 'to') {
            setToPoint(lat, lng);
            return;
        }

        if (isWaypointPoint(activeMapPoint)) {
            const index = getWaypointIndex(activeMapPoint);

            setWaypointPoint(index, lat, lng);

            const nextWaypointIndex = index + 1;
            const waypoints = getWaypoints(form);

            setActiveMapPoint(
                nextWaypointIndex < waypoints.length
                    ? getWaypointPointKey(nextWaypointIndex)
                    : 'to',
            );
        }
    }

    function handleRouteMarkerDragEnd(marker, latlng) {
        const lat = Number(latlng.lat.toFixed(6));
        const lng = Number(latlng.lng.toFixed(6));

        if (marker.id === 'from') {
            setFromPoint(lat, lng);
            setActiveMapPoint('from');
            return;
        }

        if (marker.id === 'to') {
            setToPoint(lat, lng);
            setActiveMapPoint('to');
            return;
        }

        if (isWaypointPoint(marker.id)) {
            const index = getWaypointIndex(marker.id);

            setWaypointPoint(index, lat, lng);
            setActiveMapPoint(marker.id);
        }
    }

    function handleAddWaypoint() {
        const waypoints = getWaypoints(form);
        const nextWaypoints = [...waypoints, createEmptyWaypoint()];
        const nextIndex = nextWaypoints.length - 1;

        setValue('waypoints', nextWaypoints, setValueOptions);
        setActiveMapPoint(getWaypointPointKey(nextIndex));
    }

    function handleRemoveWaypoint(index) {
        const pointKey = getWaypointPointKey(index);

        abortReverseGeocode(pointKey);

        const waypoints = getWaypoints(form);
        const nextWaypoints = waypoints.filter(
            (_, waypointIndex) => waypointIndex !== index,
        );

        setValue('waypoints', nextWaypoints, setValueOptions);

        if (activeMapPoint === pointKey) {
            setActiveMapPoint('from');
            return;
        }

        if (isWaypointPoint(activeMapPoint)) {
            const activeIndex = getWaypointIndex(activeMapPoint);

            if (activeIndex > index) {
                setActiveMapPoint(getWaypointPointKey(activeIndex - 1));
            }
        }
    }

    function clearWaypointPoint(index) {
        const pointKey = getWaypointPointKey(index);

        abortReverseGeocode(pointKey);
        setPointLoading(pointKey, false);

        setValue(`waypoints.${index}.lat`, '', setValueOptions);
        setValue(`waypoints.${index}.lng`, '', setValueOptions);
        setValue(
            `waypoints.${index}.location_data`,
            emptyLocation,
            setValueOptions,
        );

        setActiveMapPoint(pointKey);
    }

    function handleClearRoute() {
        abortReverseGeocode('from');
        abortReverseGeocode('to');

        getWaypoints(form).forEach((_, index) => {
            abortReverseGeocode(getWaypointPointKey(index));
        });

        setValue('fromLocation', '', setValueOptions);
        setValue('fromLat', '', setValueOptions);
        setValue('fromLng', '', setValueOptions);
        setValue('from_location', emptyLocation, setValueOptions);

        setValue('toLocation', '', setValueOptions);
        setValue('toLat', '', setValueOptions);
        setValue('toLng', '', setValueOptions);
        setValue('to_location', emptyLocation, setValueOptions);

        setValue('waypoints', [], setValueOptions);

        setActiveMapPoint('from');
        setLoadingPoints({
            from: false,
            to: false,
        });
    }

    function clearFromPoint() {
        abortReverseGeocode('from');
        setPointLoading('from', false);

        setValue('fromLat', '', setValueOptions);
        setValue('fromLng', '', setValueOptions);
        setValue('from_location', emptyLocation, setValueOptions);

        setActiveMapPoint('from');
    }

    function clearToPoint() {
        abortReverseGeocode('to');
        setPointLoading('to', false);

        setValue('toLat', '', setValueOptions);
        setValue('toLng', '', setValueOptions);
        setValue('to_location', emptyLocation, setValueOptions);

        setActiveMapPoint('to');
    }

    const hasWaypointValue = getWaypoints(form).some((waypoint) => {
        return (
            hasPoint(waypoint.lat, waypoint.lng) || Boolean(waypoint.location)
        );
    });

    const isClearDisabled =
        !hasPoint(form.fromLat, form.fromLng) &&
        !hasPoint(form.toLat, form.toLng) &&
        !form.fromLocation &&
        !form.toLocation &&
        !hasWaypointValue;

    return {
        activeMapPoint,
        loadingPoints,
        routeMarkers,
        routePoints,
        isClearDisabled,
        setActiveMapPoint,
        handleRouteMapClick,
        handleRouteMarkerDragEnd,
        handleClearRoute,
        clearFromPoint,
        clearToPoint,
        clearWaypointPoint,
        handleAddWaypoint,
        handleRemoveWaypoint,
        setSelectedLocationPoint,
    };
}

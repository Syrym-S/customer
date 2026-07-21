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
};

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
            geocodeResult.address || geocodeResult.label,
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
            geocodeResult.address || geocodeResult.label,
            setValueOptions,
        );
        setValue('to_location', geocodeResult, setValueOptions);
    }

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
                locationDetails.label || locationDetails.address,
                setValueOptions,
            );
            setValue('from_location', locationDetails, setValueOptions);
            setActiveMapPoint('to');
            return;
        }

        setValue('toLat', lat, setValueOptions);
        setValue('toLng', lng, setValueOptions);
        setValue(
            'toLocation',
            locationDetails.label || locationDetails.address,
            setValueOptions,
        );
        setValue('to_location', locationDetails, setValueOptions);
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

            return formatCoordinatesLabel(lat, lng);
        } finally {
            if (reverseGeocodeControllersRef.current[point] === controller) {
                reverseGeocodeControllersRef.current[point] = null;
                setPointLoading(point, false);
            }
        }
    }

    function handleRouteMapClick(latlng) {
        const lat = Number(latlng.lat.toFixed(6));
        const lng = Number(latlng.lng.toFixed(6));

        if (activeMapPoint === 'from') {
            setFromPoint(lat, lng);
            setActiveMapPoint('to');
            return;
        }

        setToPoint(lat, lng);
    }

    function handleClearRoute() {
        abortReverseGeocode('from');
        abortReverseGeocode('to');

        setValue('fromLocation', '', setValueOptions);
        setValue('fromLat', '', setValueOptions);
        setValue('fromLng', '', setValueOptions);
        setValue('from_location', emptyLocation, setValueOptions);

        setValue('toLocation', '', setValueOptions);
        setValue('toLat', '', setValueOptions);
        setValue('toLng', '', setValueOptions);
        setValue('to_location', emptyLocation, setValueOptions);

        setActiveMapPoint('from');
        setLoadingPoints({
            from: false,
            to: false,
        });
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
        }
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

    const isClearDisabled =
        !hasPoint(form.fromLat, form.fromLng) &&
        !hasPoint(form.toLat, form.toLng) &&
        !form.fromLocation &&
        !form.toLocation;

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
        setSelectedLocationPoint,
    };
}
